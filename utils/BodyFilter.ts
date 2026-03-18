
function BodyFilter<T extends Record<string, unknown>>(data: T, ...field: string[]): Partial<T> {
    const newObj: Partial<T> = {};
    Object.keys(data).forEach((item) => {
        if (field.includes(item)) {
            newObj[item as keyof T] = data[item as keyof T]
        }
    })

    return newObj;
}



export default BodyFilter




