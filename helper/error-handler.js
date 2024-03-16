function error_handler (err, req, res, next) {
    // if (err) res.status(500).json({ error: "Internal Server Error" + err });
    // jwt authentication error
    if(err.name == 'UnauthorizedError')
        return res.status(401).json({message: "The user is not authorized!"})

    // validation error
    if(err.name =='ValidationError')
        return res.status(401).json({message: err})

    // default to 500 server error
    return res.status(500).json({ message: err });
};

// export default error_handler;
