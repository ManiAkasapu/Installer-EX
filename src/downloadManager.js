const SimpleGit = require('simple-git');
const fs = require('fs');

function clonePublicRepo(url, path = process.cwd()) {
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }

    var git = SimpleGit(path);

    return git.clone(url);
}

exports.clonePublicRepo = clonePublicRepo;