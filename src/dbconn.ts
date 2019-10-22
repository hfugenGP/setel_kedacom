import { Connection, createConnection } from 'mysql'; 
import { DataFields } from './data'; 
/**
 * Connect to MySQL 
 * 
 */
export default class DbConn {
    private _conn: Connection; 

    constructor(private _tablename: string) {
        this._conn = createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER, 
            password: process.env.DB_PASSWORD, 
            database: process.env.DB_NAME
        })
    }

    /**
     * Basic search using column = value
     * 
     * @param column 
     * @param searchstring 
     * @param sort 
     * @param limit
     */
    public findByCol(queryOptions: {column: string, searchstring: string, sort?: string, limit?: number}, callback: <T>(result: T) => void) {
        try {
            let {column, searchstring, sort, limit} = queryOptions;
            let query = `SELECT * FROM ${this._tablename} WHERE ${column} = ${searchstring}`; 

            if (sort != null) {
                query += ` ORDER BY ${sort}`;
            }

            if (limit != null) {
                query += ` LIMIT ${limit}`;
            }

            this._conn.query(query, <T>(error : any, result : T, fields : any) => {
                if (error) {
                    throw error;
                }
                callback(result);
            });
        } catch(e) {
            console.log('Error occurred: ', e);
        }
    }
}