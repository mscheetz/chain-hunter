/**
 * Return a success message
 * 
 * @param {any} data data to return
 * @param {number} code status code, 200
 */
const successMessage = function(data, code = 200) {
    const response = {
        code: code,
        data: data
    }

    return response;
}

/**
 * Return an error message
 * 
 * @param {any} data data to return
 * @param {number} code status code, 401
 */
const errorMessage = function(data, code = 401) {
    const response = {
        code: code,
        data: data
    }

    return response;
}

module.exports = {
    successMessage,
    errorMessage
}