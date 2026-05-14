export function arrayFromlength(number) {
    return Array.from(new Array(number).keys()).map(k => k + 1);
};

//export default { arrayFromlength };