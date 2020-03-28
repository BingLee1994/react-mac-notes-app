let { preference } = require('../utils/db');

module.exports = {
    notesWindow(req, res) {
        let preferenceName = 'notesWindow';
        let { query } = req;
        if (Object.keys(query).length === 0) {
            let result = preference.get(preferenceName);
            res.send(result || {});
            return;
        }
        preference.add(preferenceName, query)
            .save()
            .catch(err => console.log(err))
            .finally(() => res.send('ok'));
    }
};
