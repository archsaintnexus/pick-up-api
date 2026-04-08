import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import sendToken from "../services/sendToken.js";
import otpService from "../services/otp.js";
import emailQueue from "../Queues/emailQueue.js";
import crypto from "crypto";

function buildResetUrl(req: Request, token: string) {
  if (process.env.CLIENT_URL) {
    const clientBaseUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    return `${clientBaseUrl}/reset-password/${token}`;
  }

  return `${req.protocol}://${req.get("host")}/api/v1/users/auth/resetPassword/${token}`;
}

function resetPasswordPageTemplate(resetUrl: string, formError?: string, successMessage?: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6efe4;
      --panel: #fffaf2;
      --text: #1f1a14;
      --muted: #6b6258;
      --accent: #d46a2e;
      --accent-dark: #a74b19;
      --border: #ead8c2;
      --success-bg: #edf8ef;
      --success-text: #1f6a36;
      --error-bg: #fff1ef;
      --error-text: #9a2f1d;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Georgia, "Times New Roman", serif;
      background:
        radial-gradient(circle at top left, rgba(212, 106, 46, 0.14), transparent 32%),
        linear-gradient(135deg, #f7efe3 0%, #f2e4d1 100%);
      color: var(--text);
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .card {
      width: 100%;
      max-width: 460px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: 0 24px 80px rgba(76, 43, 21, 0.12);
      padding: 32px 28px;
    }

    .eyebrow {
      margin: 0 0 10px;
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent-dark);
    }

    h1 {
      margin: 0 0 10px;
      font-size: 34px;
      line-height: 1.05;
    }

    p {
      margin: 0 0 22px;
      color: var(--muted);
      line-height: 1.6;
      font-size: 15px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    input {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 15px;
      background: #fff;
      color: var(--text);
      margin-bottom: 16px;
    }

    input:focus {
      outline: 2px solid rgba(212, 106, 46, 0.2);
      border-color: var(--accent);
    }

    button {
      width: 100%;
      border: 0;
      border-radius: 999px;
      padding: 15px 18px;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }

    .message {
      margin-top: 18px;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .message.error {
      background: var(--error-bg);
      color: var(--error-text);
    }

    .message.success {
      background: var(--success-bg);
      color: var(--success-text);
    }
  </style>
</head>
<body>
  <main class="card">
    <p class="eyebrow">Pick-Up Logistics</p>
    <h1>Choose a new password</h1>
    <p>Enter your new password below. This reset link can only be used while it is still valid.</p>

    ${formError ? `<div class="message error">${formError}</div>` : ""}
    ${successMessage ? `<div class="message success">${successMessage}</div>` : ""}

    <form method="POST" action="${resetUrl}">
      <label for="password">New password</label>
      <input id="password" name="password" type="password" minlength="8" maxlength="30" required />

      <label for="confirmPassword">Confirm password</label>
      <input id="confirmPassword" name="confirmPassword" type="password" minlength="8" maxlength="30" required />

      <button id="submit-button" type="submit">Reset password</button>
    </form>
  </main>
</body>
</html>`;
}

async function performPasswordReset(token: string, password: string, confirmPassword: string) {
  const resetToken = crypto.createHash("sha256").update(token).digest("hex")

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    throw new ErrorClass("Token is invalid or has expired", 400)
  }

  if (!confirmPassword) {
    throw new ErrorClass("Please confirm your password", 400)
  }

  if (!password) {
    throw new ErrorClass("Please provide a new password", 400)
  }

  if (password !== confirmPassword) {
    throw new ErrorClass("Password does not match", 400)
  }

  user.password = password
  user.passwordResetExpires = undefined
  user.passwordResetToken = undefined

  try {
    await user.save({ validateBeforeSave: false })
  } catch (error) {
    if (error instanceof Error) {
      throw new ErrorClass(error.message, 400)
    }

    throw error
  }

  await emailQueue.add("resetPasswordMail", {
    email: user.email
  }, {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000
    }
  })

  return user
}

export async function resetPasswordPage(req: Request, res: Response) {
  const { token } = req.params;

  if (process.env.CLIENT_URL) {
    const clientBaseUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    return res.redirect(302, `${clientBaseUrl}/reset-password/${token}`);
  }

  const resetUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  return res.status(200).type("html").send(resetPasswordPageTemplate(resetUrl));
}

export async function submitResetPasswordPage(req: Request, res: Response) {
  const { token } = req.params
  const resetUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`

  try {
    await performPasswordReset(token!, req.body.password, req.body.confirmPassword)

    return res
      .status(200)
      .type("html")
      .send(
        resetPasswordPageTemplate(
          resetUrl,
          undefined,
          "Password reset successful. You can now return to the app and log in with your new password."
        )
      )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reset password. Please try again."

    return res
      .status(error instanceof ErrorClass ? error.statusCode : 500)
      .type("html")
      .send(resetPasswordPageTemplate(resetUrl, message))
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  const existingUser = await User.findUser(req.body.email)

    if (existingUser) {
      return next(new ErrorClass("User with this email already exists", 400));
    }
  
  if (!req.body.confirmPassword) return next(new ErrorClass("Please Provide confirm your  password", 400))
  
  if(req.body.password !== req.body.confirmPassword) return next(new ErrorClass("Password does not match",400))

    const user = await User.createUser({
      fullName: req.body.fullName,
      email: req.body.email,
      companyName: req.body.companyName,
      companyAddress: req.body.companyAddress,
      role: req.body.role,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      phoneNumber2: req.body.phoneNumber2 || undefined
    });
  
  if (user.role === "admin") {
   return  res.status(201).json({
      status: "Success",
      message:"Admin Created Successfully."
    })
  }
  const otp = await otpService.generateOTP(user._id.toString())
  
 
  await emailQueue.add("sendOtp", {
     email: user.email,
     otp:otp
  }, {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay:5000 // restarts every 5 second
    }
   })
   
   res.status(201).json({
     status: "Success",
     message:"An OTP has been sent to your email."
   })
}



export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  
  if (!email || !password) return next(new ErrorClass("Invalid Credentials .. Provide Credentials to Login", 400))
  
  const user = await User.findUser(email)
  if ( !user ||   !(await user.comparePassword(password))) return next(new ErrorClass("Invalid email or password", 401))
  if (!user.isActive) return next(new ErrorClass("User does not exist",404))
  if (!user.isVerified) return next(new ErrorClass("User account not verified.. ", 401))

  
  sendToken(req,res,200,user,"Login Successful")
  
}


export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  const {email,otp} = req.body
  
  const user = await User.findUser(email)

  if (!user || !user.isActive) return next(new ErrorClass("User does not exist", 404))
  
  if(user.isVerified) return next(new ErrorClass("User is already verified. Proceed to Login Page",400))

  if(!(await otpService.verifyOTP(user._id.toString(),otp))) return next(new ErrorClass("Invalid Otp or Otp has expired",401))

  
  await emailQueue.add("email_verified/account_verified", {
    email: user.email,
    fullName:user.fullName
  })
  
  user.isVerified = true
  await user.save({validateBeforeSave:false})


  sendToken(req,res,200,user,"Your Email has been verified successfully..")


}



export async function logOut(req: Request, res: Response) {
  res.cookie("jwt", "loggedOut", {
    httpOnly: true,
    expires:new Date(0),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    status: "Success",
    message: "Logged out Successfully",
  });
  
}


export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body
  
  if(!email) return next(new ErrorClass("Email is required",400))
  
  const user = await User.findUser(email)

  if (!user) return next(new ErrorClass("User does not exist", 404))
  
  const token = user.resetPassword()
  
  await user.save({ validateBeforeSave: false })

  try {
    const resetUrl = buildResetUrl(req, token);

    await emailQueue.add("resetPassword", {
      email,
      resetUrl
    })
    res.status(200).json({
      status: "Success",
      message:"Reset Password Link sent to your email"
    })
  } catch (error) {
    console.log(error)
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false })
    
    return next(new ErrorClass("There was an error sending the email. Try again later!",500))
    
  }

}


export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  const { currentPassword, password, confirmPassword } = req.body
  
  const user = (await User.findById(req.user._id).select("+password"))!



  if (!(await user.comparePassword(currentPassword))) return next(new ErrorClass("Incorrect Password", 403))
  
    if (!confirmPassword) return next(new ErrorClass("Please confirm your  password", 400))
  
      if(password !== confirmPassword) return next(new ErrorClass("Password does not match",400))
  
  user.password = password


  await emailQueue.add("updatePasswordMail", {
    email: user.email
 }, {
   attempts: 5,
   backoff: {
     type: "exponential",
     delay:5000 // restarts every 5 second
   }
  })
  

  await user.save()

  sendToken(req,res,200,user,"Password Updated Successfully")

}


export async function resendOtp(req: Request, res: Response, next: NextFunction) {

  const { email } = req.body
  
  const user = await User.findUser(email)

  if (!user || !user.isActive) return next(new ErrorClass("User does not exist..", 404))
  if(user.isVerified) return next(new ErrorClass("User is already verified. Proceed to Login Page",400))
  
    const otp = await otpService.generateOTP(user._id.toString())
 
    await emailQueue.add("sendOtp", {
       email: user.email,
       otp:otp
    }, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay:5000 // restarts every 5 second
      }
     })
     
   
   
    
     res.status(200).json({
      status: "Success",
      message: "OTP resent to your email."
    })
  
  
}



export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await performPasswordReset(req.params.token!, req.body.password, req.body.confirmPassword)
    sendToken(req,res,200,user,"Password Reset Successful")
  } catch (error) {
    next(error)
  }
  
}


