exports.isInventoryManager = (req, res, next) => {
    if (req.data.designation !== 'admin' && req.data.designation !== 'Inventory Manager') {
        return res.status(401).send({
            message: "You are not an Inventory Manager or Admin"
        });
    }
    next();
};
