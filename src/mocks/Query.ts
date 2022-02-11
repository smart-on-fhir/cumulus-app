

interface ColumnDescriptor {
    name: string;
}

class Table
{
    columns: Column[] = [];

    name: string;

    constructor(name: string)
    {
        this.name = name
    }

    addColumn(name: string)
    {
        this.columns.push(new Column(name))
    }
}

class Column
{
    name: string;

    constructor(name: string)
    {
        this.name = name
    }
}

export default class Query
{
    // dimension1: Column;
    // dimension2: Column;
    // groupBy: Column;

    // constructor() {}

    // compile() {
    //     let q = `SELECT ${this.dimension1} ${this.dimension2} FROM tables
    //     WHERE filters ORDER BY x GROUP BY y`
    // }
}
