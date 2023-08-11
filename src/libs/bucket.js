import path from 'path'

export async function getBucketURL(folder, file) {
    const fileName = `${Date.parse(new Date().toISOString())}${path.extname(file.name)}`;

    const filePath = `${folder}/${fileName}`

    const res = await fetch(`/api/upload-file?file=${filePath}`);
    const {url, fields} = await res.json();

    return {url, fields, filePath};
}

export async function uploadToBucket(url, fields, file) {
    const formData = new FormData();
    Object.entries({...fields, file}).forEach(([key,value]) => {
        formData.append(key,value)
    });

    //Upload File
    if (url) {
        await fetch(url, {
            method: 'POST',
            body: formData
        });
    }
}

export async function deleteFromBucket(fileName) {

    await fetch(`/api/upload-file/?file=${fileName}`, {
        method: 'DELETE'
    })
}