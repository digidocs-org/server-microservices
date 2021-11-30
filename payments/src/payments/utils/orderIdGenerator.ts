
export const orderId = {
    generate: () => {
        let now = Date.now().toString();

        // pad with additional random digits
        if (now.length < 14) {
            const pad = 14 - now.length;
            now += randomNumber(pad);
        }

        // split into xxxx-xxxxxx-xxxx format
        return "DCS-" + [now.slice(0, 4), now.slice(10, 14)].join('-');
    },
};

const randomNumber = (length: number) => {
    return Math.floor(
        Math.pow(10, length - 1) +
        Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
    ).toString();
}