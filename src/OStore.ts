import { IKeyValue, IReplaySubjectIndex } from '@fs/types';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators'

let { values } = Object;

export class OStore {

    /**
     * Key Value pair entries
     */
    private entries: IKeyValue = {};

    /**
     * Key Value pair entries
     */
    private subjects: IReplaySubjectIndex = {};

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
        //Emit immediately so that Observers can receive 
        //the value straight away.
        this.subjects[key].next(value);
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
    public observe(key:string) {
        return this.subjects[key].asObservable();
    }

   /**
     * Check whether a value exists.
     * 
     * @param key 
     * @return An {@link Observable<boolean>} indicating whether the value exists.
     */
    public exists(key:string) {
        if (!this.subjects[key]) {
            throw new Error(`No subject exists for the key ${key}`);
        }
        return this.subjects[key].asObservable().pipe(map(v => v != null));
    }

    /**
     * Observe changes to the values.
     * 
     * @param key 
     * @return A snapshot of the value corresponding to the key.
     */
    public select(key:string):any {
        return this.entries[key];
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