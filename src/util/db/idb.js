const DB_NAME = "events";
const DB_VERSION = 2;

let DB;

export default {
  async getDb() {
    return new Promise((resolve, reject) => {
      if (DB) {
        return resolve(DB);
      }

      let request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = e => {
        console.log("Error opening db", e);
        reject("Error");
      };

      request.onsuccess = e => {
        DB = e.target.result;
        resolve(DB);
      };

      request.onupgradeneeded = e => {
        console.log("upgrade needed");
        let db = e.target.result;
        if (e.oldVersion < 1) {
          db.createObjectStore("events", {
            autoIncrement: true,
            keyPath: "address"
          });
        }
        if (e.oldVersion < 2) {
          db.createObjectStore("users", {
            autoIncrement: false,
            keyPath: "account"
          });
        }
      };
    });
  },

  /* ----------------------- EVENTS -------------------------- */

  async getEvents() {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(["events"], "readonly");
      trans.oncomplete = () => {
        resolve(events);
      };

      let store = trans.objectStore("events");
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
      let trans = db.transaction(["events"], "readonly");
      trans.oncomplete = () => {
        resolve(event);
      };

      let store = trans.objectStore("events");
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
      let trans = db.transaction(["events"], "readwrite");
      trans.oncomplete = () => {
        resolve(true);
      };

      trans.onerror = e => {
        console.log(e);
        resolve(false);
      };
      let store = trans.objectStore("events");
      console.log(event);
      store.put(event);
    });
  },

  /* ----------------------- USERS -------------------------- */

  async getUser(account) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(["users"], "readonly");
      trans.oncomplete = () => {
        resolve(user);
      };

      let store = trans.objectStore("users");
      let user;

      store.openCursor().onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
          if (cursor.value.account == account) {
            user = cursor.value;
          }
          cursor.continue();
        }
      };
    });
  },

  async getUsers() {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(["users"], "readonly");
      trans.oncomplete = () => {
        resolve(users);
      };

      let store = trans.objectStore("users");
      let users = [];

      store.openCursor().onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
          users.push(cursor.value);
          cursor.continue();
        }
      };
    });
  },

  async saveUser(user) {
    let db = await this.getDb();

    return new Promise(resolve => {
      let trans = db.transaction(["users"], "readwrite");
      trans.oncomplete = () => {
        resolve(true);
      };

      trans.onerror = e => {
        console.log(e);
        resolve(false);
      };
      let store = trans.objectStore("users");
      store.put(user);
    });
  }
};
