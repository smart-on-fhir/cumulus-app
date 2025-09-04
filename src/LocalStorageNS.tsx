function getKeyName(key: string) {
    return VITE_APP_PREFIX ? `${VITE_APP_PREFIX}/${key}` : key;
}

export function getItem(key: string) {
    return localStorage.getItem(getKeyName(key));
}

export function setItem(key: string, value: any) {
    localStorage.setItem(getKeyName(key), value);
}

export function removeItem(key: string) {
    localStorage.removeItem(getKeyName(key));
}

export default {
    getItem,
    setItem,
    removeItem
};