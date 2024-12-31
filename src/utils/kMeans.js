export const kMeans = (data, k = 1) => {
    const centroids = data.slice(0, k);
    const distances = new Array(data.length).fill(new Array(k).fill(0));
    const classes = new Array(data.length).fill(-1);
    let condition = true;

    while (condition) {

        condition = false;

        for (let d in data) {
            for (let c = 0; c < k; c++) {
                distances[d][c] = Math.hypot(
                    ...Object.keys(data[0]).map(key => data[d][key] - centroids[c][key])
                );
            }
            const m = distances[d].indexOf(Math.min(...distances[d]));
            if (classes[d] !== m) condition = true;
            classes[d] = m;
        };

        for (let c = 0; c < k; c++) {
            centroids[c] = new Array(data[0].length).fill(0);
            const size = data.reduce((result, _, d) => {
                if (classes[d] === c) {
                    result++;
                    for (let i in data[0])
                        centroids[c][i] += data[d][i];
                }
                return result;
            }, 0);

            for (let i in data[0])
                centroids[c][i] = parseFloat(
                    Number(centroids[c][i] / size).toFixed(2)
                );
        }
    };
  
    return classes;

};
