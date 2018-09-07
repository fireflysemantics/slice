import { IKeyValue, IKeyReplaySubject } from './types';
import { ReplaySubject } from 'rxjs';

let { values } = Object;

export class KeyValueStore {

    /**
     * Key Value pair entries
     */
    private entries: IKeyValue = {};

    /**
     * Key Value pair entries
     */
    private subjects: IKeyReplaySubject = {};

    /**
     * Set create a key value pair entry and creates a 
     * corresponding replay subject instance that will
     * be used to broadcast updates.
     * 
     * @param key The key identifying the value
     * @param value The value
     */
    public post(key:string, value:any) {
        this.entries[key] = value;
        this.subjects[key] = new ReplaySubject(1);
    }

    /**
     * Update a value and notify subscribers.
     * 
     * @param key 
     * @param value 
     */
    public put(key:string, value:any) {
        this.entries[key] = value;
        this.subjects[key].next(value);
    }

    /**
     * Deletes both the value entry and the corresponding {@link ReplaySubject}.
     * Will unsubscribe the {@link ReplaySubject} prior to deleting it,
     * severing communication with corresponding {@link Observable}s.
     *  
     * @param key 
     */
    public delete(key:string) {
        delete this.entries[key];
        this.subjects[key].unsubscribe();
        delete this.subjects[key];
    }


    /**
     * Observe changes to the values.
     * 
     * @param key 
     * @return An {@link Observable} of the value
     */
    public select(key:string) {
        return this.subjects[key].asObservable();
    }


    /**
     * Indicates whether the store is empty.
     * @return true if the store is empty, false otherwise.
     */
    public isEmpty() {
        return values(this.entries).length == 0;
    }

    /**
     * Returns the number of key value pairs contained.
     * 
     * @return the number of entries in the store.
     */
    public count() {
        return values(this.entries).length;
    }

}