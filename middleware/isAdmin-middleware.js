exports.isAdmin = (req, res, next) => {
    console.log(req.data);
    if (req.data.designation !== 'admin') {
        return res.status(401).send({
            message: "You are not an admin"
        })
    }
    next();
}