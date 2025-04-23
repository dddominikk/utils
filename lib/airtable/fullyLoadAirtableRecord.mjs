export function fullyLoadAirtableRecord(record, table) {

    this.table ??= table ?? new TypeError(`Table not defined`)

    if (this.table instanceof Error)
        throw this.table;

    this.fieldIds ??= Object.fromEntries(this.table.fields.map(f => [f.id.toLowerCase(), f]));
    this.fieldNames ??= Object.fromEntries(this.table.fields.map(f => [f.name.toLowerCase(), f]));



    const fields = Object.fromEntries(
        Object.values(this.table.fields)
            .map((field, i) => {
                const { name, id } = field;
                const value = record.getCellValue(name);
                const stringValue = record.getCellValueAsString(name);
                return [
                    name, {
                        value,
                        stringValue,
                        get parent() { return field }
                    }]
            })
    );

    const fieldRefs = { ...this.fieldIds, ...this.fieldNames };


    const fieldsProxy = new Proxy(fields, {

        get(target, key) {

            const keyCheck = fieldRefs?.[key.toString().toLowerCase()]?.name;

            if (!!keyCheck)
                return target[keyCheck];

        }
    });

    const fieldsOfType = (...fieldTypes) => {
        const lowercaseAllowedTypes = [fieldTypes].flat(1).filter(Boolean).map(t => t.toLowerCase());
        const filteredFields = {};

        for (const fRef in fieldsProxy) {

            if (lowercaseAllowedTypes.includes(fieldsProxy?.[fRef]?.parent?.type.toLowerCase()))
                filteredFields[fRef] = fieldsProxy[fRef];
        }
        return filteredFields;
    }


    /**
     * @typedef {(...args: allowedTypes) => Partial<LoadedRecord['fields']>} FieldsOfType
     * @typedef {string[]} allowedTypes Case-insensitive Airtable field types.
     * 
     * @typedef LoadedCell
     * @prop {ReturnType<AirtableRecord['getCellValue']>} LoadedCell.value
     * @prop {ReturnType<AirtableRecord['getCellValueAsString']>} LoadedCell.stringValue
     * @prop {table['fields'][number]} LoadedCell.parent The parent field.
     * 
     * @typedef RecProps Extra record properties.
     * @prop {Table} LoadedRecord.parent The record's parent table.
     * @prop {string} LoadedRecord.url The record's URL.
     * @prop {Record<string, LoadedCell >} LoadedRecord.fields
     * @prop {FieldsOfType} LoadedRecord.fieldsOfType
     *
     * @typedef {AirtableRecord & RecProps} LoadedRecord 
    */


    /** @type {LoadedRecord} */
    const loadedRecord = Object.assign(
        Object.defineProperties(record, {
            parent: { get: () => this.table },
            url: { get: () => `${this.table.url}/${record.id}` },
        }),
        { fields: fieldsProxy, fieldsOfType }

    );

    return loadedRecord;

};
