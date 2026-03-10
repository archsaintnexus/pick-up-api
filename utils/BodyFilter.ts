
function BodyFilter(data: any, ...field: string[]) {
    let newObj: Record<string, any> = {};
  
    
    Object.keys(data).forEach((item) => {
        if (!field.includes(item)) newObj[item] = data[item]
    })

    return newObj;
}



export default BodyFilter




