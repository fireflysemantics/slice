import { ReplaySubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface OStoreInitReset {
    i:any
    r?:any
}

export interface OStoreStart {
    [key: string]: OStoreInitReset
}


export class OStore {

    /**
     * Start keys and values
     * passed in via constructor.
     */
    public start:OStoreStart

    constructor(start?:OStoreStart) {
        if (start) {
            this.start = start;
            const keys = Object.keys(start)

            keys.forEach((k,i)=>{
                this.post(k, start[k].i)
            })
        }
    }

    public reset() {
        if(this.start) {
            const keys = Object.keys(this.start)
            keys.forEach((k,i)=>{
                this.put(k, this.start[k].r ? this.start[k].r : this.start[k].i)
            })
        }
    }

    /**
     * Key Value pair entries
     * containing values store in this store.
     */
    private entries:Map<any, any> = new Map()

    /**
     * Map of replay subject id to `ReplaySubject` instance.
     */
    private subjects: Map<any, ReplaySubject<any>> = new Map()

    /**
     * Set create a key value pair entry and creates a 
     * corresponding replay subject instance that will
     * be used to broadcast updates.
     * 
     * @param key The key identifying the value
     * @param value The value
     */
    public post(key: any, value:any) {
        this.entries.set(key, value)
        this.subjects.set(key,  new ReplaySubject(1))
        //Emit immediately so that Observers can receive 
        //the value straight away.
        this.subjects.get(key).next(value)
    }

    /**
     * Update a value and notify subscribers.
     * 
     * @param key 
     * @param value 
     */
    public put(key:any, value:any) {
        this.entries.set(key, value)
        this.subjects.get(key).next(value)
    }

    /**
     * Deletes both the value entry and the corresponding {@link ReplaySubject}.
     * Will unsubscribe the {@link ReplaySubject} prior to deleting it,
     * severing communication with corresponding {@link Observable}s.
     *  
     * @param key 
     */
    public delete(key:any) {
        this.entries.delete(key)
        this.subjects.get(key).unsubscribe()
        this.subjects.delete(key)
    }

    /**
     * Observe changes to the values.
     * 
     * @param key 
     * @return An {@link Observable} of the value
     */
    public observe(key:any) {
        return this.subjects.get(key).asObservable()
    }

   /**
     * Check whether a value exists.
     * 
     * @param key 
     * @return An {@link Observable<boolean>} indicating whether the value exists.
     */
    public exists(key:any):Observable<boolean> {
        if (!this.subjects.get(key)) {
            throw new Error(`No subject exists for the key ${key}`)
        }
        return this.subjects.get(key).asObservable().pipe(map(v => v != null))
    }

    /**
     * Retrieve a snapshot of the 
     * value.
     *  
     * @param key 
     * @return A snapshot of the value corresponding to the key.
     */
    public snapshot(key:any):any {
        return this.entries.get(key)
    }

    /**
     * Indicates whether the store is empty.
     * @return true if the store is empty, false otherwise.
     */
    public isEmpty() {
        return Array.from(this.entries.values()).length == 0
    }

    /**
     * Returns the number of key value pairs contained.
     * 
     * @return the number of entries in the store.
     */
    public count() {
        return Array.from(this.entries.values()).length
    }
}