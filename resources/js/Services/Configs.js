
export const axiosHeader = () => {
    let header = {
        "Accept" : "application/json",
        "Content-Type" : "application/json",
    };
    if (typeof localStorage.getItem('token') !== 'undefined') {
        if (typeof localStorage.getItem('token') === 'string') {
            if (localStorage.getItem('token') !== null) {
                if (localStorage.getItem('token').length > 10) {
                    header.Authorization = `Bearer ${localStorage.getItem('token')}`
                }
            }
        }
    }
    if (typeof localStorage.getItem('locale_lang') !== 'undefined') {
        if (typeof localStorage.getItem('locale_lang') === 'string') {
            if (localStorage.getItem('locale_lang') !== null) {
                if (localStorage.getItem('locale_lang').length > 0) {
                    header.Language = localStorage.getItem('locale_lang');
                }
            }
        }
    }
    return header;
}
