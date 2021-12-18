export const loadTextFileAsync = async (...path) => {
    let requests = path.map(p => fetch(p));
    let responses = await Promise.all(requests);
    if (responses.every(res => res.ok))
        return Promise.all(responses.map(res => res.text()));

    throw new Error('通信エラー');
};
