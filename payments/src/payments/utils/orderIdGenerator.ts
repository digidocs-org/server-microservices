
export const orderId = {
    generate: () => {
        let now = Date.now().toString();

        // pad with additional random digits
        if (now.length < 14) {
            const pad = 14 - now.length;
            now += randomNumber(pad);
        }

        // split into xxxx-xxxxxx-xxxx format
        return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('-');
    },
    getTime: (orderId: string) => {
        let res = orderId.replace(/-/g, '');
        res = res.slice(0, 13);
        return parseInt(res, 10);
    }
};

const randomNumber = (length: number) => {
    return Math.floor(
        Math.pow(10, length - 1) +
        Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
    ).toString();
}