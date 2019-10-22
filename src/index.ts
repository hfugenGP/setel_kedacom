import { Dsn, NewRow, DataFields } from "./data.d"; 
import { config } from "dotenv"; 
import { resolve } from 'path'; 
import DbConn from './dbconn';
import PetronasApi from "./request"; 
import * as moment from 'moment';

export default class KedaCom {   
    private _dsn: Dsn; 
    private _mysqlEvents: any; 
    private _mysqlEventsWatcher: any; 
    private _petronas: PetronasApi;

    constructor() {       
        this._dsn = {
            host: process.env.DB_HOST, 
            user: process.env.DB_USER, 
            password: process.env.DB_PASSWORD
        }; 

        this._mysqlEvents = require('mysql-events'); 
        this._mysqlEventsWatcher = this._mysqlEvents(this._dsn); 

        this._petronas = PetronasApi.getInstance();
    }

    /**
     * Start db monitor
     * 
     */
    public monitor(): void {        
        let watcher = this._mysqlEventsWatcher.add(
            `${process.env.DB_NAME}.data`, 
            (oldRow: any, newRow: any, event: any) => {
                if (oldRow === null) {
                    this._newRow(newRow);
                }
            }, 
            'match this string or regex'
        );
    }

    /**
     * Process new row.
     * 
     * @param newRow 
     */
    private _newRow(newRow: NewRow) {
        console.log('Bay Number: ', newRow.fields.CDBH);
        console.log('License Plate', newRow.fields.HPHM); 
        console.log('Time Stamp', newRow.fields.JGSJ); 
        let dbconn = new DbConn('data'); 
        dbconn.findByCol({
            column: 'CDBH', 
            searchstring: newRow.fields.CDBH, 
            limit: 2, 
            sort: 'JGSJ DESC'
        }, (result) => {             
            let res = <DataFields[]><unknown>result;
            if (res != null && res.length != 0) {  
                this._process(res, newRow.fields.HPHM);
            } else { 
                console.log('Send enter status for ', newRow.fields.HPHM, newRow.fields.JGSJ); 
                this._sendApiRequest(newRow.fields, 'enter');
            }
        });
    }

    /**
     * Set status, i.e. enter or exit.
     * 
     * @param result 
     * @param licenseplate 
     */
    private _process(result: DataFields[], licenseplate: string): void {
        if (result != null) {             
            if (result.length <= 1) { 
                if (result[0].HPHM != licenseplate) {            
                    // Send exit status to Petronas API for vehicle that was previously 
                    // on the specified pump bay.
                    console.log('Send enter status for ', result[0].HPHM, result[0].JGSJ); 
                    this._sendApiRequest(result[0], 'enter');
                } else {
                    console.log('Send enter status as this the newly inserted row.'); 
                    this._sendApiRequest(result[0], 'enter');
                }
            } else {
                if (result[1].HPHM != licenseplate) { 
                    // Send exit status to Petronas API for vehicle that was previously 
                    // on the specified pump bay.
                    console.log('send exit status for ', result[1].HPHM, result[1].JGSJ); 
                    this._sendApiRequest(result[1], 'exit'); 

                    // Send enter status for current vehicle on pump bay.
                    console.log('send enter status for ', result[0].HPHM, result[0].JGSJ); 
                    this._sendApiRequest(result[0], 'enter');

                } else {
                    let time_diff = Math.round(moment().diff(moment(new Date(result[1].JGSJ)))/1000); 
                    
                    if (time_diff <= 120) {
                        console.log('Check for time span. Ignore if less than 2 mins');
                    } else {
                        // Send enter status for current vehicle on pump bay.
                        console.log('send enter status for ', result[1].HPHM, result[1].JGSJ); 
                        this._sendApiRequest(result[1], 'enter');
                    }
                }
            }
        } else {
            console.log('No record(s).');
        }
    }

    /**
     * Send POST request to SETEL api.
     * 
     * @param vehicle 
     * @param status 
     */
    private _sendApiRequest(vehicle: DataFields, status: string): void {
        this._petronas.vehicleStatus({
            "eventType" : status, 
            "timestamp" : new Date(vehicle.JGSJ).toISOString(), 
            "licensePlateNumber": vehicle.HPHM, 
            "pumpNumber": Number(vehicle.CDBH), 
            "stationId": process.env.STATION_ID
        }).then((result) => { 
            if (result != null) {
                console.log(result.status, ':' , result.statusText);
            }
        }).catch(e => {
            console.log('Error occured: ', e);
        });
    }
    
}

// Load env file
config({ path: resolve(__dirname, "../.env") }); 
let kedacom = new KedaCom(); 
kedacom.monitor();