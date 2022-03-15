import { ReplaySubject, Observable } from 'rxjs'

/**
 * Initialize hte store with this.
 */
export interface ValueReset {
    value: any
    reset?: any
}

/**
 * OStore Key Value Reset
 */
export interface ObsValueReset {
    value: any
    reset?: any
    obs: Observable<any>
}

export interface KeyObsValueReset {
    [key: string]: ObsValueReset
}

export interface OStoreStart {
    [key: string]: ValueReset
}

export class OStore<E extends KeyObsValueReset> {
    /**
     * Start keys and values
     * passed in via constructor.
     */
    public S!: E

    constructor(start: OStoreStart) {
        if (start) {
            this.S = <E>start;
            const keys = Object.keys(start)
            keys.forEach((k) => {
                const ovr = start[k] as ObsValueReset
                this.post(ovr, ovr.value)
                ovr.obs = this.observe(ovr)
            })
        }
    }

    /**
     * Reset the state of the OStore to the
     * values or reset provided in the constructor
     * {@link OStoreStart} instance.
     */
    public reset() {
        if (this.S) {
            const keys = Object.keys(this.S)
            keys.forEach((k) => {
                const ovr: ObsValueReset = this.S[k]
                this.put(ovr, ovr.reset ? ovr.reset : ovr.value)
            })
        }
    }

    /**
     * Clear all entries
     */
    public clear() {
        this.entries.clear()
    }


    /**
     * Map of Key Value pair entries
     * containing values store in this store.
     */
    public entries: Map<any, any> = new Map()

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
    public post(key: any, value: any) {
        this.entries.set(key, value)
        this.subjects.set(key, new ReplaySubject(1))
        //Emit immediately so that Observers can receive 
        //the value straight away.
        const subject = this.subjects.get(key)
        if (subject) {
            subject.next(value)
        }
    }
    /**
     * Update a value and notify subscribers.
     * 
     * @param key 
     * @param value 
     */
    public put(key: any, value: any) {
        this.entries.set(key, value)
        const subject = this.subjects.get(key)
        if (subject) {
            subject.next(value)
        }
    }

    /**
     * Deletes both the value entry and the corresponding {@link ReplaySubject}.
     * Will unsubscribe the {@link ReplaySubject} prior to deleting it,
     * severing communication with corresponding {@link Observable}s.
     *  
     * @param key 
     */
    public delete(key: any) {
        this.entries.delete(key)
        this.subjects.delete(key)
        const subject = this.subjects.get(key)
        if (subject) {
            subject.unsubscribe()
        }
    }

    /**
     * Observe changes to the values.
     * 
     * @param key 
     * @return An {@link Observable} of the value
     */
    public observe(key: any) {
        return this.subjects.get(key)!.asObservable()
    }

    /**
      * Check whether a value exists.
      * 
      * @param key 
      * @return True if the entry exists ( Is not null or undefined ) and false otherwise.
      */
    public exists(key: any): boolean {
        return this.entries.get(key) != null
    }

    /**
     * Retrieve a snapshot of the 
     * value.
     *  
     * @param key 
     * @return A snapshot of the value corresponding to the key.
     */
    public snapshot(key: any): any {
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