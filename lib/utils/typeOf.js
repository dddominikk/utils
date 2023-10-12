const typeOf =/**
 * @template {!never & undefined|null|''|any} Obj
 * @arg value {Obj} 
 */ (value) => ({
        value,
        type: Object.prototype.toString.call(value)
            .slice(7, -1)
            .toLowerCase()
            .trim()
    });
