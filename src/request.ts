import axios, { AxiosInstance, AxiosPromise } from 'axios';
import { PetronasRequest } from './data.d';

export default class PetronasApi {
    private static instance: PetronasApi;
    private _api: AxiosInstance;

    private constructor() {
        this._api = axios.create({
            baseURL: process.env.SETEL_API, 
            "headers": {
                "access_token" : process.env.ACCESS_TOKEN
            }
        });
    }

    /**
     * Singleton
     * 
     */
    public static getInstance(): PetronasApi {
        if (!PetronasApi.instance) {
            PetronasApi.instance = new PetronasApi;
        }
        return PetronasApi.instance;
    }
    
    /**
     * Send POST request to Setel API
     * 
     * @param body 
     */
    public vehicleStatus(body: PetronasRequest): AxiosPromise<any> {
        return this._api.post('/api/cameras/license-plate-events', body);
    }
}