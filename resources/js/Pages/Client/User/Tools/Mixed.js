export const sortDate = (props, type = 'login') => {
    let response = null;
    if (props.meta.last[type] !== null) {
        return props.meta.last[type].created_at;
    }
    return response;
}
