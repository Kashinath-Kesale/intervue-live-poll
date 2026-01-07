export const getSessionId = () => {
    let id = sessionStorage.getItem('sessionId');

    if(!id) {
        id = `student-${crypto.randomUUID()}`;
        sessionStorage.setItem('sessionId', id);
    }

    return id;
}