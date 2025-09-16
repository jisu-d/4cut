import React from "react";

export const createFrameData = (
    processedImage: React.RefObject<Blob | null>,
    isPublic: boolean,
    author: string,
    frameName: string,
    authorPw: string,
    desc: string
): FormData => {
    const formData = new FormData();

    if (processedImage.current) {
        formData.append('image', processedImage.current, `${frameName || 'untitled'}.jpg`);
    }

    formData.append('isPublic', String(isPublic));
    formData.append('author', author);
    formData.append('frameName', frameName);
    formData.append('authorPw', authorPw);
    formData.append('desc', desc);

    console.log(formData.get('image'));
    return formData;
};