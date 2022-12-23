export function stringifyQuery(queryObj) {
    let queryParams = new URLSearchParams();
    for (let [key, value] of Object.entries(queryObj)) {

        // Rejects empty string/null/undefined params
        if (value) {
            if (Array.isArray(value)) {
                value.forEach(item => queryParams.append(key, item));
            }
            // Format dates before sending
            else if (["start", "end"].includes(key)) {
                queryParams.append(key, value.format("YYYY-MM-DD"));
            }
            else {
                queryParams.append(key, value);
            }
        }
    }
    return queryParams.toString();
}

export function transformData(result, pageSize) {
    let responseData = result.data;
    let transformedData = result.data;
    if (responseData.length !== pageSize) {
        let dummyRows = [];
        for (let i = 1; i <= pageSize - responseData.length; i++) {
            dummyRows.push({ invoiceNumber: i / 10 });
        }
        transformedData = [...responseData, ...dummyRows];
    }

    return {
        data: transformedData,
        pagination: JSON.parse(result?.headers["x-pagination"]),
    };
}

export function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}