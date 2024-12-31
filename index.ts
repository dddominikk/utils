


export function UtilsTest(config: UtilsTestConfig) {
    const result = `Ok, Mr. ${config.ratio}!`;
    console.log(result);
    return result;
}


type UtilsTestConfig = {
    ratio: number;
};