const DB_NAME = 'events';
const DB_VERSION = 3;

let DB;

export default {

    async getDb() {
        return new Promise((resolve, reject) => {
            if(DB) { return resolve(DB); }

            console.log('opening db: ', DB);
            let request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = e => {
                console.log('Error opening db', e);
                reject('Error');
            };

            request.onsuccess = e => {
                DB = e.target.result;
                resolve(DB);
            };

            request.onupgradeneeded = e => {
                console.log('upgrade needed');
                let db = e.target.result;
                if (e.oldVersion < 1) {
                    db.createObjectStore('events', {autoIncrement: true, keyPath: 'address'});
                } 
                if (e.oldVersion < 2) {
                    db.createObjectStore('blocks', {autoIncrement: true, keyPath: 'index'});
                }
                if (e.oldVersion < 3) {
                    db.createObjectStore('userTickets', {autoIncrement: false, keyPath: 'address'});
                }
            };
        });
    },

    async getBlocks() {
        let db = await this.getDb();

        return new Promise(resolve => {

            let trans = db.transaction(['blocks'], 'readonly');
            trans.oncomplete = () => {
                resolve(blocks);
            }

            let store = trans.objectStore('blocks');
            let blocks = [];

            store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    blocks.push(cursor.value);
                    cursor.continue();
                }
            };
        });
    },

    async saveBlock(block) {
        let db = await this.getDb();

        return new Promise(resolve => {
            let trans = db.transaction(['blocks'], 'readwrite');
            trans.oncomplete = () => {
                resolve(true);
            };
            trans.onerrer = () => {
                resolve(false);
            }
            console.log(block);
            let store = trans.objectStore('blocks');
            store.put({blockNumber: block});
        });
    },


    async getEvents() {
        let db = await this.getDb();

        return new Promise(resolve => {

            let trans = db.transaction(['events'], 'readonly');
            trans.oncomplete = () => {
                resolve(events);
            }

            let store = trans.objectStore('events');
            let events = [];

            store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    events.push(cursor.value);
                    cursor.continue();
                }
            };
        });
    },

    async getEvent(eventAddress) {
        let db = await this.getDb();

        return new Promise(resolve => {

            let trans = db.transaction(['events'], 'readonly');
            trans.oncomplete = () => {
                resolve(event);
            }

            let store = trans.objectStore('events');
            let event;

            store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    if (cursor.value.contractAddress == eventAddress) {
                        event = cursor.value;
                    }
                    cursor.continue();
                }
            };
        });
    },

    async saveEvent(event) {
        let db = await this.getDb();

        return new Promise(resolve => {
            let trans = db.transaction(['events'], 'readwrite');
            trans.oncomplete = () => {
                resolve(true);
            };

            trans.onerror = e => {
                console.log(e);
                resolve(false);
            }
            let store = trans.objectStore('events');
            console.log(event);
            store.put(event);
        });
    },


    /* ----------------------- USER TICKETS -------------------------- */

  async saveUserTickets(tickets) {
    let db = await this.getDb();

    return new Promise(resolve => {
        let trans = db.transaction(['userTickets'], 'readwrite');
        trans.oncomplete = () => {
            resolve(true);
        };

        trans.onerror = e => {
            console.log(e);
            resolve(false);
        }
        let store = trans.objectStore('userTickets');
        console.log(tickets);
        store.put(tickets);
    });
  },

  async getUserTickets(address) {
    let db = await this.getDb();

    return new Promise(resolve => {

        let trans = db.transaction(['userTickets'], 'readonly');
        trans.oncomplete = () => {
            console.log(userTickets)
            resolve(userTickets);
        }

        let store = trans.objectStore('userTickets');
        let userTickets = {
            fungibleTickets: [],
            nonFungibleTickets: [],
            address: address,
        };

        store.openCursor().onsuccess = e => {
            let cursor = e.target.result;
            if (cursor) {
                console.log(cursor.value.address);
                console.log(address);
                if (cursor.value.address === address){
                    console.log('found entry');

                    userTickets = cursor.value;
                }
                cursor.continue();
            }
        };
    });
},


}