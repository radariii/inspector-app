declare module WL.JSONStore {

		/**
    	* Starts one or more collections.
    	*
    	*	@param {Object} collections Metadata about the collections.
    	*	@param {string} collections.collectionName Name of the the collection, must be an alphanumeric string ([a-z, A-Z, 0-9]) that starts with a letter.
    	*	@param {Object} collections.collectionName.searchFields The key value pairs in the data that will be indexed, by default nothing is indexed.
    	*	@param {Object} [collections.collectionName.additionalSearchFields] The additional key value pairs that will be indexed, by default nothing is indexed.
    	*	@param {Object} [collections.collectionName.adapter] Metadata about the adapter that will be linked to the collection.
    	*	@param {string} collections.collectionName.adapter.name Name of the Adapter.
    	*	@param {string} [collections.collectionName.adapter.add] Name of the add procedure.
    	*	@param {string} [collections.collectionName.adapter.remove] Name of remove procedure.
    	*	@param {Object} [collections.collectionName.adapter.load] Metadata about the load procedure.
    	*	@param {string} collections.collectionName.adapter.load.procedure Name of the load procedure.
    	*	@param {array}  collections.collectionName.adapter.load.params Parameters that are sent to the load procedure.
    	*	@param {string} collections.collectionName.adapter.load.key Key in the response object containing objects to add.
    	*	@param {function} [collections.collectionName.adapter.accept] Called after push with the response from the adapter, must return a boolean.
    	*	@param {integer} [collections.collectionName.adapter.timeout] Timeout for the adapter call.
    	*
    	* 	@param {Object} [options] Options that apply to the store.
    	*	@param {string} [options.username] Name of the file that is created to store data for the collections,
    	*			must be an alphanumeric string ([a-z, A-Z, 0-9]) and start with a letter. The default one is 'jsonstore'.
    	*	@param {string} [options.password] Password that is used to secure the contents of the store, by default there is no data encryption.
    	*	@param {boolean} [options.clear] Clears accessors without removing its contents from the store.
    	*	@param {boolean} [options.localKeyGen] Flag that determines if key generation uses a local (false) or remote (true) random number generator.
    	*	@param {boolean} [options.analytics] Enable the collection of analytics information for Android and iOS.
    	*	@param {integer} [options.pbkdf2Iterations] Change the number of iterations used by the Password-Based Key Derivation Function 2 (PBKDF2) algorithm used to secure the password. The default is 10,000 iterations. This is currently only supported on Android, and will be ignored in other versions, using 10,000 in those.
    	*
    	* @return {Promise} Resolved when all collections have been initialized.
    	*		Rejected when there is a failure (no accessors created).
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function init(collections: Object, options?:Object): WLPromise;

		/**
    	* Provides an accessor to the collection if the collection exists, otherwise it returns undefined.
    	*
    	* @param {string} collectionName Name of the collection.
    	*
    	* @return {WL.JSONStore.JSONStoreInstance} Allows access to the collection by name.
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function get(collectionName: string): WL.JSONStore.JSONStoreInstance;

		/**
		* Returns information about the file that is used to persist data in the store. The following key value pairs are returned:
		* name - name of the store,
		* size - the total size, in bytes, of the store,
		* and isEncrypted - boolean that is true when encrypted and false otherwise.
		*
		* @return {Promise} Resolved when the operation succeeds.
		*   Rejected when there is a failure.
		*
		* @methodOf WL.JSONStore#
		*/
    function fileInfo(): WLPromise;

		/**
    	* Locks access to all the collections until WL.JSONStore.init is called.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function closeAll(options: Object): WLPromise;

		/**
    	* Takes an _id and a JSON object and creates a JSONStore document.
    	*
    	* @param {integer} id _id for the Document
    	* @param {Object} data JSON data for the Document
    	*
    	* @return {Object} JSONStore document.
    	*
    	* @deprecated Since IBM® Worklight® V6.2.0.
    	* @methodOf WL.JSONStore#
    	*/
    function documentify(id: number, data: Object): Object;

		/**
    	* Changes the password for the internal storage.
    	* @description You must have an initialized collection before calling WL.JSONStore.changePassword.
    	* @param {string} oldPassword The old password. Must be alphanumeric ([a-z, A-Z, 0-9]), begin with a letter and have least 1 character.
    	*
    	* @param {string} newPassword The new password Must be alphanumeric ([a-z, A-Z, 0-9]), begin with a letter and have least 1 character.
    	*
    	* @param {string} [username] Default user name is 'jsonstore'. Must be alphanumeric ([a-z, A-Z, 0-9]), begin with a letter and have least 1 character.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	* @param {integer} 	[options.pbkdf2Iterations] Change the number of iterations used by the Password-Based Key Derivation Function 2 (PBKDF2) algorithm used to secure the password. The default is 10,000 iterations. This is currently only supported on Android, and will be ignored in other versions, using 10,000 in those.
    	*
    	* @return {Promise} Resolved when the operation succeeds.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function changePassword(oldPassword: string, newPassword: string, username: string, options:Object): WLPromise;

		/**
    	* Completely wipes data for all users, destroys the internal storage, and clears security artifacts.
    	*
    	* @param {string} [username] Only removes data that is related to the specific username that is passed.
    	* @param {Object} [options] Deprecated.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds.
    	*  Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function destroy(options: Object): WLPromise;

		/**
    	* Returns the message that is associated with a JSONStore error code.
    	*
    	* @param {number} errorCode The error code.
    	*
    	* @return {string} The Error Message that is associated with the status code or 'Not Found'
    	*        if you pass an invalid value (non-integer) or a nonexistent status code.
    	* @methodOf WL.JSONStore#
    	*/
    function getErrorMessage(errorCode: number): string;

		/**
    	* Initiates a transaction.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an integer.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function startTransaction(): WLPromise;

		/**
    	* Commit a transaction.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an integer.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function commitTransaction(): WLPromise;

		/**
    	* Roll back a transaction.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an integer.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function rollbackTransaction(): WLPromise;

		/**
    	* Removes the password from memory.
    	*
    	* @return {boolean} Returns true if the password that is stored in memory was set to null, false if there was no password
    	* in memory or if it was not set to null.
    	*
    	* @deprecated Since IBM® Worklight® V5.0.6, it is no longer needed if you use WL.JSONStore.init
    	* @methodOf WL.JSONStore#
    	*/
    function clearPassword(): boolean;

		/**
    	* Returns an accessor (also known a JSONStoreInstance) to a single collection.
    	*
    	* @param {string} name Name of the the collection, must be an alphanumeric string ([a-z, A-Z, 0-9]) that starts with a letter.
    	* @param {object} searchFields The key value pairs in the data that will be indexed, by default nothing is indexed.
    	* @param {options} options Options that you can pass to WL.JSONStore.init.
    	*
    	* @return {WL.JSONStore.JSONStoreInstance} Accessor to a single collection.
    	*
    	* @deprecated Since IBM® Worklight® V5.0.6, it is no longer needed if you use WL.JSONStore.init
    	* @methodOf WL.JSONStore#
    	*/
    function initCollection(name: string, searchFields: Object, options: Object): WL.JSONStore.JSONStoreInstance;

		/**
    	* Sets the password that is used to generate keys to encrypt data that is stored locally on the device.
    	*
    	* @param {string} pwd String that contains the password.
    	*
    	* @return {boolean} Returns true if the password is a valid string, false otherwise.
    	*
    	* @deprecated Since IBM® Worklight® V5.0.6, it is no longer needed if you use WL.JSONStore.init
    	* @methodOf WL.JSONStore#
    	*/
    function usePassword(pwd: string): boolean;

		/**
    	* Creates a query for advanced find. See {@link WL.JSONStore.QueryPart} for more information.
    	*
    	* @example
    	* WL.JSONStore.QueryPart();
    	*
    	* @methodOf WL.JSONStore#
    	*/
    function QueryPart(): WL.JSONStore._QueryPart;
    
    class JSONStoreInstance {

		/**
    	* Stores data as documents inside a collection.
    	*
    	* @param {array|object} data Data to be added the collection.
    	* @param {Object} [options]
    	* @param {Object} [options.additionalSearchFields] Search fields that are not part of the data passed.
    	* @param {boolean} [options.markDirty] Default value is true, determines if the data will be marked as dirty.
    	* @param {boolean} [options.push] Deprecated. Default value is true, determines if the data will be marked as needed to be pushed to an adapter.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns the number of documents added.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     add(data: Object[]|Object, options: Object): WLPromise;

		/**
    	* Returns the number of documents inside a collection.
    	*
    	* @param {Object} [query] Defines what to search for in the collection. If it is not passed, it will count everything in the collection.
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an integer.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     count(query: Object, options: Object): WLPromise;

		/**
    	* The enhance function allows developers to extend the core API to better fit their needs.
    	*
    	* @param {string} name Function name.
    	* @param {Function} fn Function to add to the JSONStoreInstance prototype for a specific collection.
    	*
    	* @return {number} 0 return code for success or an error code for failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     enhance(name: string, fn: Function): number;

		/**
    	* Locates a document inside a collection using a query.
    	*
    	* @param {array|Object} query Defines what to search for in the collection.
    	* @param {Object} [options]
    	* @param {boolean} [options.exact] Default is false and will do fuzzy searches, true will do exact searches.
    	* @param {integer} [options.limit] Maximum amount of documents to return, the default behavior is to return everything.
    	* @param {integer} [options.offset] Amount of documents to skip from the results, depends on the limit.
    	* @param {array} [options.filter] Return only the specified search fields, by default return _id and json.
    	* @param {array} [options.sort] Sort documents based on their search fields, either ascending or descending.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an array of results.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     find(query: Object[]|Object, options: Object): WLPromise;

		/**
    	* Locates a document inside a collection by using query parts.
    	* @description
    	* The ability to search using between, inside, lessThan, greaterThan, etc. in your query search. Consider using the following helper
    	* WL.JSONStore.QueryPart.
    	*
    	* @param {array} query Defines what to search for in the collection.
    	* @param {Object} [options]
    	* @param {integer} [options.limit] Maximum number of documents to return, the default behavior is to return everything.
    	* @param {integer} [options.offset] Number of documents to skip from the results, depends on the limit.
    	* @param {array} [options.filter] Return only the specified search fields, by default return _id and json.
    	* @param {array} [options.sort] Sort documents based on their search fields, either ascending or descending.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an array of results.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     advancedFind(query: Object[], options: Object): WLPromise;

		/**
    	* Returns all of the documents stored in a collection.
    	*
    	* @param {Object} [options]
    	* @param {integer} [options.limit] Maximum amount of documents to return, the default behavior is to return everything.
    	* @param {integer} [options.offset] Amount of documents to skip from the results, depends on the limit.
    	* @param {array} [options.filter] Filter and select document's specified searchfields. If no filter array is passed, all searchfields are returned.
    	* @param {array} [options.sort] Sort documents based on their searchfields, either ascending or descending.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an array of results.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     findAll(options: Object): WLPromise;

		/**
    	* Returns one or more documents that match the _id that is supplied to the function.
    	*
    	* @param {array} data An array of _id 
    	* @param {Object} [options]
    	* @param {array} [options.filter] Return only the specified search fields, by default return _id and json.
    	* @param {array} [options.sort] Sort documents based on their search fields, either ascending or descending.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an array of results.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     findById(data: Object[], options: Object): WLPromise;

		/**
    	* Returns all documents that are marked dirty. This function was previously called JSONStoreIntance.getPushRequired.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns array of documents.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     getAllDirty(options: Object): WLPromise;

		/**
    	* Returns a boolean that is true if the document is dirty, false otherwise.
    	* This function was previously called JSONStoreIntance.isPushRequired.
    	*
    	* @param {Object|number} doc JSONStore style document or _id
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, return a boolean.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     isDirty(doc: Object|number, options: Object): WLPromise;

		/**
    	* Gets data that is defined in the load portion of the adapter.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns number of documents loaded.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @deprecated Since IBM® Worklight® V6.2.0.
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     load(options: Object): WLPromise;

		/**
    	* Pushes documents inside the collection that have local-only changes to an IBM® MobileFirst® adapter
    	* that is linked during the init function.
    	*
    	* @param {array|Object|number} [options] Options object, array of documents, single document or an _id.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an array.
    	*   Array returned is either empty (everything worked) or full of error responses.
    	*		Rejected when there is a failure.
    	*
    	* @deprecated Since IBM® Worklight® V6.2.0.
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     push(options: Object[]|Object|number): WLPromise;

		/**
    	* Returns the number of documents with local-only changes (that is, dirty documents).
    	* This function was previously called JSONStoreIntance.pushRequiredCount.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an integer.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     countAllDirty(options: Object): WLPromise;

		/**
    	* Marks a document as deleted inside a collection.
    	*
    	* @param {array|object|integer} doc Document, array of documents, query object or _id.
    	* @param {Object} [options]
    	* @param {boolean} [options.markDirty] Default value is true, determines if the data will be marked as dirty.
    	* @param {boolean} [options.push] Deprecated. Default value is true, determines if the data will be marked as needed to be pushed to an adapter.
        * @param {boolean} [options.exact] Default is false and will do fuzzy searches, true will do exact searches.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     remove(doc: Object[]|Object|number, options: Object): WLPromise;

		/**
    	* Deletes all the documents that are stored inside a collection.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     removeCollection(options: Object): WLPromise;

		/**
    	* Clears a collection for reuse.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     clear(options: Object): WLPromise;

		/**
    	* Marks an array of documents as clean. Takes input from JSONStoreIntance.getAllDirty,
    	* which returns documents that have: _operation, _dirty, _id,
    	* json, and _deleted.
    	*
    	* @param {array} docs array of documents
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns number of clean documents.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     markClean(docs: Object[], options: Object): WLPromise;

		/**
    	* Overwrites a document with a given document.
    	*
    	* @param {array|Object} doc Document or array of documents.
    	* @param {Object} [options]
    	* @param {boolean} [options.markDirty] Default value is true, determines if the data will be marked as dirty.
    	* @param {boolean} [options.push] Deprecated. Default value is true, determines if the data will be marked as needed to be pushed to an adapter.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an integer.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     replace(doc: Object[]|Object, options: Object): WLPromise;

		/**
    	* Used to load data when existing data exists in the store. Internally it is an alias for a targeted replace and add.
    	*
    	* @param {array|object} doc Data to be added the collection.
    	* @param {Object} [options]
    	* @param {boolean} [options.addNew] Default value is false, determines if the data will added if data is not in collection.
    	* @param {boolean} [options.markDirty] Default value is false, determines if the data will be marked as dirty.
    	* @param {array} [options.replaceCriteria] Determines which documents will be replaced based on the given search field or search fields.
    	* If the parameter is not specified or is an empty array, then the data will not be replaced.
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns the number of documents replaced or added.
    	*		Rejected when there is a failure.
    	*
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     change(doc: Object[]|Object, options: Object): WLPromise;

		/**
    	* Prints the contents of the collection by using  WL.Logger.debug asynchronously.
    	*
    	* @param {number} [limit] Maximum amount of documents to show. Use 0 for no documents,
    	*	if limit is missing it will print up to the first 100 documents.
    	*	@param {number} [offset] Number of documents to skip. Requires a valid limit.
    	*
    	* @return {Promise} Resolved when the operation succeeds, returns an integer.
    	*		Rejected when there is a failure.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     toString(limit: number, offset: number): WLPromise;

		/**
    	* Pushes only the selected documents.
    	*
    	* @param {Object|array} doc Document or array of documents.
    	*
    	* @param {Object} [options]
    	* @param {function} [options.onSuccess] Deprecated. Success callback.
    	* @param {function} [options.onFailure] Deprecated. Failure callback.
    	*
    	* @return {Promise} Resolved when the operation succeeds.
    	*   Rejected when there is a failure.
    	*
    	* @deprecated Since IBM Worklight v5.0.6, it is no longer needed if you use WL.JSONStore.JSONStoreInstance.push.
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	*/
     pushSelected(doc: Object|Object[], options: Object): WLPromise;

		/**
    	* Deletes a document from the collection.
    	*
    	* @param {array|object|number} doc Document, array of documents, query object or _id.
    	* @param {Object} [options]
    	* @param {boolean} [options.push] Default value is false, determines if the data will be marked as needed to be pushed to an adapter.
    	* @param {function} [options.onSuccess] Success callback.
    	* @param {function} [options.onFailure] Failure callback.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	* @deprecated Since IBM® Worklight® V5.0.6, it is no longer needed if you use WL.JSONStore.JSONStoreInstance.remove
    	* with {push: false}.
    	*/
     erase(doc: Object[]|Object|number, options: Object): void;

		/**
    	* Writes data to a collection.
    	*
    	* @param {Object|array} docs Data to store in the collection.
    	* @param {Object} [options]
    	* @param {Object} [options.additionalSearchFields] Search fields that are not part of the data that is passed.
    	* @param {boolean} [options.push] Default value is false, determines if the data will be marked as needed to be pushed to an adapter.
    	* @param {function} [options.onSuccess] Success callback.
    	* @param {function} [options.onFailure] Failure callback.
    	*
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	* @deprecated Since IBM® Worklight® V5.0.6, it is no longer needed if you use WL.JSONStore.JSONStoreInstance.add
    	* with {push: false}.
    	*/
     store(doc: Object|Object[], options: Object): void;

		/**
    	* Replaces a document with another document.
    	*
    	* @param {array|object} doc Document or array of documents.
    	* @param {object} [options]
    	* @param {boolean} [options.push] Default value is false, determines if the data will be marked as needed to be pushed to an adapter.
    	* @param {function} [options.onSuccess] Success callback.
    	* @param {function} [options.onFailure] Failure callback.
    	*
    	* @methodOf WL.JSONStore.JSONStoreInstance#
    	* @deprecated Since IBM® Worklight® V5.0.6, it is no longer needed if you use WL.JSONStore.JSONStoreInstance.replace
    	* with {push: false}.
    	*/
     refresh(doc: Object[]|Object, options: Object): void;
}

      class _QueryPart {

		/**
    	* Add a like clause to a query for advanced find.
    	* @description
    	* Behaves like the fuzzy option in WL.JSONStore.JSONStoreInstance.find. See WL.JSONStore.JSONStoreInstance.find for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string} value Determines what string value to use to compare in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().like('name', 'ca');
    	*	//arr = [{$like: [{ name : 'ca' }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     like(searchField: string, value: string): Object[];

		/**
    	* Add a not like clause to a query for advanced find.
    	* @description
    	* The negative of like. See WL.JSONStore.QueryPart.like for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string} value Determines what string value to use to compare in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().notLike('name', 'ca');
    	*	//arr = [{$notLike: [{ name : 'ca' }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     notLike(searchField: string, value: string): Object[];

		/**
    	* Add a left clause to a query for advanced find.
    	* @description
    	* Similar to WL.JSONStore.QueryPart.like except only use input from the left.
    	* See WL.JSONStore.Query.like for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string} value Determines what string value to use to compare in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().leftLike('name', 'ca');
    	*	//arr = [{$leftLike: [{ name : 'ca' }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     leftLike(searchField: string, value: string): Object[];

		/**
    	* Add a not left clause to a query for advanced find.
    	* @description
    	* The negative of left like. See WL.JSONStore.QueryPart.leftLike for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string} value Determines what string value to use to compare in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().notLeftLike('name', 'ca');
    	*	//arr = [{$notLeftLike: [{ name : 'ca' }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     notLeftLike(searchField: string, value: string): Object[];

		/**
    	* Add a right clause to a query for advanced find.
    	* @description
    	* Similar to WL.JSONStore.QueryPart.like except only use input from the right.
    	* See WL.JSONStore.QueryPart.like for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string} value Determines what string value to use to compare in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().rightLike('name', 'ca');
    	*	//arr = [{$rightLike: [{ name : 'ca' }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     rightLike(searchField: string, value: string): Object[];

		/**
    	* Add a not right clause to a query for advanced find.
    	* @description
    	* The negative of right like. See WL.JSONStore.QueryPart.rightLike for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string} value Determines what string value to use to compares in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().notRightLike('name', 'ca');
    	*	//arr = [{$notRightLike: [{ name : 'ca' }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     notRightLike(searchField: string, value: string): Object[];

		/**
    	* Add an equal to clause to a query for advanced find.
    	* @description
    	* Behaves like the exact option in WL.JSONStore.JSONStoreInstance.find. See WL.JSONStore.JSONStoreInstance.find for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string|integer|number} value Determines what value to use to compare in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().equal('age', 35);
    	*	//arr = [{$equal: [{ age : 35 }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     equal(searchField: string, value: string|number): Object[];

		/**
    	* Add a not equal to clause to a query for advanced find.
    	* @description
    	* The negative of equal. See WL.JSONStore.QueryPart.equal for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {string} value Determines what string value to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().notEqual('name', 'ca');
    	*	//arr = [{$notEqual: [{ name : 'ca' }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     notEqual(searchField: string, value: string): Object[];

		/**
    	* Add a less than clause to a query for advanced find.
    	* @description
    	* The less than clause will make comparisons between the query and the document in the collection and return document(s) if
    	* the selected search field or additional search field value are less than the value given by the query.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {integer|number} value Determines what value to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().lessThan('age', 40);
    	*	//arr = [{$lessThan: [{ age : 40 }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     lessThan(searchField: string, value: number): Object[];

		/**
    	* Add a less or equal than clause to a query for advanced find.
    	* @description
    	* The less than equal clause will make comparisons between the query and the document in the collection and return document(s) if
    	* the selected search field or additional search field value are less than or equal to the value given by the query.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {integer|number} value Determines what value to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().lessOrEqualThan('age', 40);
    	*	//arr = [{$lessOrEqualThan: [{ age : 40 }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     lessOrEqualThan(searchField: string, value: number): Object[];

		/**
    	* Add a greater than clause to a query for advanced find.
    	* @description
    	* The greater than clause will make comparisons between the query and the document in the collection and return document(s) if
    	* the selected search field or additional search field values are greater than the value given by the query.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {integer|number} value Determines what value to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().greaterThan('age', 40);
    	*	//arr = [{$greaterThan: [{ age : 40 }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     greaterThan(searchField: string, value: number): Object[];

		/**
    	* Add a greater or equal thanclause to a query for advanced find.
    	* @description
    	* The greater than equal clause will make comparisons between the query and the documents in the collection and return document(s) if
    	* the selected search field or additional search field values are greater than or equal to the value given by the query.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {integer|number} value Determines what value to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().greaterOrEqualThan('age', 40);
    	*	//arr = [{$greaterOrEqualThan: [{ age : 40 }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     greaterOrEqualThan(searchField: string, value: number): Object[];

		/**
    	* Add a between clause to a query for advanced find.
    	* @description
    	* The between clause will make comparisons between the query and the documents in the collection and return documents(s) if
    	* the selected search field or additional search field values are between the range given by the query.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {array} value The range of values, integer or number, to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().between('gpa', [3.0, 4.0]);
    	*	//arr = [{$between: [{ gpa : [3.0, 4.0] }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     between(searchField: string, value: Object[]): Object[];

		/**
    	* Add a not between clause to a query for advanced find.
    	* @description
    	* The negative of between. See WL.JSONStore.QueryPart.between for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {array} value The range of values, integer or number, to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().notBetween('gpa', [3.0, 4.0]);
    	*	//arr = [{$notBetween: [{ gpa : [3.0, 4.0] }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     notBetween(searchField: string, value: Object[]): Object[];

		/**
    	* Add an in clause to a query for advanced find.
    	* @description
    	* The in clause with make comparisons between the query and the documents in the collection and return document(s) if
    	* the selected search field or additional search field values given by the query are contained in the document.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {array} value The range of values to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().inside('gpa', [3.0, 4.0]);
    	*	//arr = [{$inside: [{ gpa : [3.0, 4.0] }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     inside(searchField: string, value: Object[]): Object[];

		/**
    	* Add a not in clause to a query for advanced find.
    	* @description
    	* The negative of in. See WL.JSONStore.QueryPart.inside for more information.
    	*
    	* @param {string} searchField Determines what search field or additional search field to use in the query.
    	* @param {array} value The range of values to use in the query.
    	*
    	* @return {array} Returns a formatted query array.
    	*
    	* @example
    	* var arr = WL.JSONStore.QueryPart().notBetween('gpa', [3.0, 4.0]);
    	*	//arr = [{$notBetween: [{ gpa : [3.0, 4.0] }]}]
    	*
    	* @methodOf WL.JSONStore.QueryPart#
    	*/
     notInside(searchField: string, value: Object[]): Object[];
}
    
}



