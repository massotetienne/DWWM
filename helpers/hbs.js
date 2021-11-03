module.exports = {

    stripTags: function (input) {
        return input.replace(/<(?:.|\n)*?>/gm, '');
    },
    limit: function (arr, limit) {
        if (!Array.isArray(arr)) {
            return [];
        }
        return arr.slice(0, limit);
    }
}