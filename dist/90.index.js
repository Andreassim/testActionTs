"use strict";
exports.id = 90;
exports.ids = [90];
exports.modules = {

/***/ 90:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "LokaliseApi": () => (/* reexport */ LokaliseApi),
  "LokaliseApiOAuth": () => (/* reexport */ LokaliseApiOAuth),
  "LokaliseApiOta": () => (/* reexport */ LokaliseApiOta),
  "LokaliseAuth": () => (/* reexport */ LokaliseAuth),
  "LokaliseOtaBundles": () => (/* reexport */ LokaliseOtaBundles)
});

;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/lokalise/base_client.js
class BaseClient {
    clientData = {
        token: "",
        tokenType: "",
        authHeader: "x-api-token",
        enableCompression: false,
    };
    /*
     * Instantiate LokaliseApi to call API methods
     * @param params  object, mandatory
     * @returns       LokaliseApi object to work with.
     */
    constructor(params) {
        const apiKey = params["apiKey"];
        if (apiKey === null || apiKey === undefined || apiKey.length === 0) {
            throw new Error("Error: Instantiation failed: Please pass an API key");
        }
        this.clientData.token = apiKey;
        const compression = params["enableCompression"];
        if (compression !== null && compression !== undefined) {
            this.clientData.enableCompression = compression;
        }
        this.clientData.host = params.host;
    }
}
//# sourceMappingURL=base_client.js.map
// EXTERNAL MODULE: external "fs/promises"
var promises_ = __webpack_require__(292);
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/lokalise/pkg.js

class LokalisePkg {
    static pkgPath() {
        return "../../package.json";
    }
    static async getVersion() {
        let pkg;
        try {
            pkg = JSON.parse((await (0,promises_.readFile)(new URL(LokalisePkg.pkgPath(), import.meta.url))).toString());
        }
        catch (_e) {
            pkg = null;
        }
        return pkg ? pkg.version : "unknown";
    }
}
//# sourceMappingURL=pkg.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/http_client/base.js

class ApiRequest {
    promise;
    params = {};
    urlRoot = "https://api.lokalise.com/api2/";
    constructor(uri, method, body, params, clientData) {
        // Since we modify params, we need to make a copy of it so we don't modify the original
        this.params = { ...params };
        this.promise = this.createPromise(uri, method, body, clientData);
        return this;
    }
    async createPromise(uri, method, body, clientData) {
        uri = `/${clientData.version}/${uri}`;
        const url = this.composeURI(uri);
        const prefixUrl = clientData.host ?? this.urlRoot;
        const options = {
            method: method,
        };
        const headers = new Headers({
            Accept: "application/json",
            "User-Agent": `node-lokalise-api/${await LokalisePkg.getVersion()}`,
        });
        headers.append(clientData.authHeader, `${clientData.tokenType} ${clientData.token}`);
        if (clientData.enableCompression) {
            headers.append("Accept-Encoding", "gzip,deflate");
        }
        if (method !== "GET" && body) {
            options.body = JSON.stringify(body);
            headers.append("Content-type", "application/json");
        }
        options.headers = headers;
        const target = new URL(url, prefixUrl);
        target.search = new URLSearchParams(this.params).toString();
        try {
            const response = await fetch(target, options);
            let responseJSON;
            if (response.status === 204) {
                responseJSON = null;
            }
            else {
                responseJSON = await response.json();
            }
            if (response.ok) {
                return Promise.resolve({
                    json: responseJSON,
                    headers: response.headers,
                });
            }
            return Promise.reject(this.getErrorFromResp(responseJSON));
        }
        catch (err) {
            return Promise.reject({ message: err.message });
        }
    }
    getErrorFromResp(respJson) {
        if (typeof respJson["error"] === "object") {
            return respJson["error"];
        }
        else {
            return respJson;
        }
    }
    composeURI(rawUri) {
        const regexp = /{(!{0,1}):(\w*)}/g;
        const uri = rawUri.replace(regexp, this.mapUriParams());
        return uri.endsWith("/") ? uri.slice(0, -1) : uri;
    }
    mapUriParams() {
        return (_entity, isMandaratory, paramName) => {
            if (this.params[paramName] != null) {
                const t_param = this.params[paramName];
                // We delete the param so we don't send it as a query param as well.
                delete this.params[paramName];
                return t_param;
            }
            else {
                if (isMandaratory === "!") {
                    throw new Error("Missing required param: " + paramName);
                }
                else {
                    return "";
                }
            }
        };
    }
}
//# sourceMappingURL=base.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/paginated_result.js
class PaginatedResult {
    totalResults;
    totalPages;
    resultsPerPage;
    currentPage;
    items;
    constructor(items, headers) {
        this.totalResults = this.safeParseInt(headers.get("x-pagination-total-count"));
        this.totalPages = this.safeParseInt(headers.get("x-pagination-page-count"));
        this.resultsPerPage = this.safeParseInt(headers.get("x-pagination-limit"));
        this.currentPage = this.safeParseInt(headers.get("x-pagination-page"));
        this.items = items;
        return this;
    }
    hasNextPage() {
        return this.currentPage > 0 && this.currentPage < this.totalPages;
    }
    hasPrevPage() {
        return this.currentPage > 1;
    }
    isLastPage() {
        return !this.hasNextPage();
    }
    isFirstPage() {
        return !this.hasPrevPage();
    }
    nextPage() {
        if (this.isLastPage()) {
            return this.currentPage;
        }
        else {
            return this.currentPage + 1;
        }
    }
    prevPage() {
        if (this.isFirstPage()) {
            return this.currentPage;
        }
        else {
            return this.currentPage - 1;
        }
    }
    safeParseInt(str) {
        if (!str)
            return 0;
        return parseInt(str, 10);
    }
}
//# sourceMappingURL=paginated_result.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/base_collection.js


class BaseCollection {
    clientData;
    static rootElementName;
    static rootElementNameSingular;
    static endpoint;
    static prefixURI;
    static elementClass;
    // Secondaries are used when an instance of a different class has to be created
    // For example, uploading a File may return a QueuedProcess
    static secondaryElementNameSingular;
    static secondaryElementClass;
    constructor(clientData) {
        this.clientData = clientData;
    }
    doList(req_params) {
        const params = {
            ...req_params,
        };
        return this.createPromise("GET", params, this.populateArrayFromJson, this.handleReject, null);
    }
    doGet(id, req_params = {}) {
        const params = {
            ...req_params,
            id,
        };
        return this.createPromise("GET", params, this.populateObjectFromJsonRoot, this.handleReject, null);
    }
    doDelete(id, req_params = {}) {
        const params = {
            ...req_params,
            id,
        };
        return this.createPromise("DELETE", params, this.returnBareJSON, this.handleReject, null);
    }
    doCreate(body, req_params = {}, resolveFn = this.populateObjectFromJson) {
        const params = {
            ...req_params,
        };
        return this.createPromise("POST", params, resolveFn, this.handleReject, body);
    }
    doUpdate(id, body, req_params, resolveFn = this.populateObjectFromJsonRoot, method = "PUT") {
        const params = {
            ...req_params,
            id,
        };
        return this.createPromise(method, params, resolveFn, this.handleReject, body);
    }
    populateObjectFromJsonRoot(json, headers) {
        const childClass = this.constructor;
        if (childClass.rootElementNameSingular) {
            json = Object(json)[childClass.rootElementNameSingular];
        }
        return this.populateObjectFromJson(json, headers);
    }
    populateSecondaryObjectFromJsonRoot(json, headers) {
        const childClass = this.constructor;
        json = Object(json)[childClass.secondaryElementNameSingular];
        return this.populateObjectFromJson(json, headers, true);
    }
    populateObjectFromJson(json, _headers, secondary = false) {
        const childClass = this.constructor;
        if (secondary) {
            return new childClass.secondaryElementClass(json);
        }
        else {
            return new childClass.elementClass(json);
        }
    }
    populateArrayFromJsonBulk(json, headers) {
        const childClass = this.constructor;
        const arr = [];
        const jsonArray = json[childClass.rootElementName];
        for (const obj of jsonArray) {
            arr.push(this.populateObjectFromJson(obj, headers));
        }
        const result = {
            errors: json["errors"],
            items: arr,
        };
        return result;
    }
    populateArrayFromJson(json, headers) {
        const childClass = this.constructor;
        const arr = [];
        const jsonArray = json[childClass.rootElementName];
        for (const obj of jsonArray) {
            arr.push(this.populateObjectFromJson(obj, headers));
        }
        if (headers.get("x-pagination-total-count") &&
            headers.get("x-pagination-page")) {
            const result = new PaginatedResult(arr, headers);
            return result;
        }
        else {
            return arr;
        }
    }
    populateApiErrorFromJson(json) {
        return json;
    }
    returnBareJSON(json) {
        return json;
    }
    handleReject(data) {
        return this.populateApiErrorFromJson(data);
    }
    async createPromise(method, params, resolveFn, rejectFn, body, uri = null) {
        const request = this.prepareRequest(method, body, params, uri);
        try {
            const data = await request.promise;
            let result = null;
            if (resolveFn !== null) {
                result = resolveFn.call(this, data["json"], data["headers"]);
            }
            return Promise.resolve(result);
        }
        catch (err) {
            return Promise.reject(rejectFn.call(this, err));
        }
    }
    prepareRequest(method, body, params, uri) {
        return new ApiRequest(this.getUri(uri), method, body, params, this.clientData);
    }
    getUri(uri) {
        const childClass = this.constructor;
        if (!uri) {
            uri = childClass.prefixURI;
        }
        return uri;
    }
    objToArray(raw_body) {
        if (!Array.isArray(raw_body)) {
            return Array(raw_body);
        }
        else {
            return raw_body;
        }
    }
}
//# sourceMappingURL=base_collection.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/base_model.js
class BaseModel {
    constructor(params) {
        for (const key of Object.keys(params)) {
            this[key] = params[key];
        }
    }
}
//# sourceMappingURL=base_model.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/branch.js

class Branch extends BaseModel {
}
//# sourceMappingURL=branch.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/branches.js


class Branches extends BaseCollection {
    static rootElementName = "branches";
    static rootElementNameSingular = "branch";
    static prefixURI = "projects/{!:project_id}/branches/{:id}";
    static elementClass = Branch;
    list(request_params) {
        return this.doList(request_params);
    }
    create(branch_params, request_params) {
        return this.doCreate(branch_params, request_params, this.populateObjectFromJsonRoot);
    }
    get(branch_id, request_params) {
        return this.doGet(branch_id, request_params);
    }
    update(branch_id, branch_params, request_params) {
        return this.doUpdate(branch_id, branch_params, request_params);
    }
    delete(branch_id, request_params) {
        return this.doDelete(branch_id, request_params);
    }
    merge(branch_id, request_params, body = {}) {
        const params = {
            ...request_params,
            ...{ id: branch_id },
        };
        return this.createPromise("POST", params, this.returnBareJSON, this.handleReject, body, "projects/{!:project_id}/branches/{:id}/merge");
    }
}
//# sourceMappingURL=branches.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/comment.js

class Comment extends BaseModel {
}
//# sourceMappingURL=comment.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/comments.js


class Comments extends BaseCollection {
    static rootElementName = "comments";
    static rootElementNameSingular = "comment";
    static prefixURI = "projects/{!:project_id}/keys/{!:key_id}/comments/{:id}";
    static elementClass = Comment;
    list(request_params) {
        return this.doList(request_params);
    }
    create(comment_params, request_params) {
        const body = { comments: this.objToArray(comment_params) };
        return this.doCreate(body, request_params, this.populateArrayFromJson);
    }
    get(comment_id, request_params) {
        return this.doGet(comment_id, request_params);
    }
    delete(comment_id, request_params) {
        return this.doDelete(comment_id, request_params);
    }
    list_project_comments(params) {
        return this.createPromise("GET", params, this.populateArrayFromJson, this.handleReject, null, "projects/{!:project_id}/comments");
    }
}
//# sourceMappingURL=comments.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/contributor.js

class Contributor extends BaseModel {
}
//# sourceMappingURL=contributor.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/contributors.js


class Contributors extends BaseCollection {
    static rootElementName = "contributors";
    static rootElementNameSingular = "contributor";
    static prefixURI = "projects/{!:project_id}/contributors/{:id}";
    static elementClass = Contributor;
    list(request_params) {
        return this.doList(request_params);
    }
    create(contributor_params, request_params) {
        const body = { contributors: this.objToArray(contributor_params) };
        return this.doCreate(body, request_params, this.populateArrayFromJson);
    }
    get(contributor_id, request_params) {
        return this.doGet(contributor_id, request_params);
    }
    update(contributor_id, contributor_params, request_params) {
        return this.doUpdate(contributor_id, contributor_params, request_params);
    }
    delete(contributor_id, request_params) {
        return this.doDelete(contributor_id, request_params);
    }
}
//# sourceMappingURL=contributors.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/file.js

class File extends BaseModel {
}
//# sourceMappingURL=file.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/queued_process.js

class QueuedProcess extends BaseModel {
}
//# sourceMappingURL=queued_process.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/files.js



class Files extends BaseCollection {
    static rootElementName = "files";
    static prefixURI = "projects/{!:project_id}/files/{:id}";
    static elementClass = File;
    static secondaryElementNameSingular = "process";
    static secondaryElementClass = QueuedProcess;
    list(request_params) {
        return this.doList(request_params);
    }
    upload(project_id, upload) {
        return this.createPromise("POST", { project_id: project_id }, this.populateSecondaryObjectFromJsonRoot, this.handleReject, upload, "projects/{!:project_id}/files/upload");
    }
    download(project_id, download) {
        return this.createPromise("POST", { project_id: project_id }, this.returnBareJSON, this.handleReject, download, "projects/{!:project_id}/files/download");
    }
    delete(file_id, request_params) {
        return this.doDelete(file_id, request_params);
    }
}
//# sourceMappingURL=files.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/jwt.js

class jwt_Jwt extends BaseModel {
}
//# sourceMappingURL=jwt.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/jwt.js


class Jwt extends BaseCollection {
    static prefixURI = "projects/{!:project_id}/tokens";
    static elementClass = jwt_Jwt;
    create(project_id, body = { service: "ota" }) {
        const request_params = { project_id: project_id };
        return this.doCreate(body, request_params, this.populateObjectFromJson);
    }
}
//# sourceMappingURL=jwt.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/key.js

class Key extends BaseModel {
}
//# sourceMappingURL=key.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/keys.js


class Keys extends BaseCollection {
    static rootElementName = "keys";
    static rootElementNameSingular = "key";
    static prefixURI = "projects/{!:project_id}/keys/{:id}";
    static elementClass = Key;
    list(request_params) {
        return this.doList(request_params);
    }
    create(key_params, request_params) {
        return this.doCreate(key_params, request_params, this.populateArrayFromJsonBulk);
    }
    get(key_id, request_params) {
        return this.doGet(key_id, request_params);
    }
    update(key_id, key_params, request_params) {
        return this.doUpdate(key_id, key_params, request_params);
    }
    delete(key_id, request_params) {
        return this.doDelete(key_id, request_params);
    }
    bulk_update(key_params, request_params) {
        return this.createPromise("PUT", request_params, this.populateArrayFromJsonBulk, this.handleReject, key_params, "projects/{!:project_id}/keys");
    }
    bulk_delete(key_ids, request_params) {
        const keys = { keys: this.objToArray(key_ids) };
        return this.createPromise("DELETE", request_params, this.returnBareJSON, this.handleReject, keys, "projects/{!:project_id}/keys");
    }
}
//# sourceMappingURL=keys.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/language.js

class Language extends BaseModel {
}
//# sourceMappingURL=language.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/languages.js


class Languages extends BaseCollection {
    static rootElementName = "languages";
    static rootElementNameSingular = "language";
    static prefixURI = "projects/{!:project_id}/languages/{:id}";
    static elementClass = Language;
    system_languages(params = {}) {
        return this.createPromise("GET", params, this.populateArrayFromJson, this.handleReject, null, "system/languages");
    }
    list(request_params) {
        return this.doList(request_params);
    }
    create(raw_body, request_params) {
        const body = { languages: this.objToArray(raw_body) };
        return this.doCreate(body, request_params, this.populateArrayFromJsonBulk);
    }
    get(lang_id, request_params) {
        return this.doGet(lang_id, request_params);
    }
    update(lang_id, lang_params, request_params) {
        return this.doUpdate(lang_id, lang_params, request_params);
    }
    delete(lang_id, request_params) {
        return super.doDelete(lang_id, request_params);
    }
}
//# sourceMappingURL=languages.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/order.js

class Order extends BaseModel {
}
//# sourceMappingURL=order.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/orders.js


class Orders extends BaseCollection {
    static rootElementName = "orders";
    static prefixURI = "teams/{!:team_id}/orders/{:id}";
    static elementClass = Order;
    list(request_params) {
        return this.doList(request_params);
    }
    create(order_params, request_params) {
        return this.doCreate(order_params, request_params, this.populateObjectFromJsonRoot);
    }
    get(order_id, request_params) {
        return this.doGet(order_id, request_params);
    }
}
//# sourceMappingURL=orders.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/payment_card.js

class PaymentCard extends BaseModel {
}
//# sourceMappingURL=payment_card.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/payment_cards.js


class PaymentCards extends BaseCollection {
    static rootElementName = "payment_cards";
    static rootElementNameSingular = "payment_card";
    static prefixURI = "payment_cards/{:id}";
    static elementClass = PaymentCard;
    list(request_params = {}) {
        return this.doList(request_params);
    }
    create(card_params) {
        return this.doCreate(card_params);
    }
    get(card_id) {
        return this.doGet(card_id);
    }
    delete(card_id) {
        return this.doDelete(card_id);
    }
}
//# sourceMappingURL=payment_cards.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/project.js

class Project extends BaseModel {
}
//# sourceMappingURL=project.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/projects.js


class Projects extends BaseCollection {
    static rootElementName = "projects";
    static prefixURI = "projects/{:id}";
    static elementClass = Project;
    list(request_params = {}) {
        return this.doList(request_params);
    }
    create(project_params) {
        return this.doCreate(project_params);
    }
    get(project_id) {
        return this.doGet(project_id);
    }
    update(project_id, project_params) {
        return this.doUpdate(project_id, project_params, {}, this.populateObjectFromJson);
    }
    delete(project_id) {
        return this.doDelete(project_id);
    }
    empty(project_id) {
        return this.createPromise("PUT", { project_id: project_id }, this.returnBareJSON, this.handleReject, null, "projects/{!:project_id}/empty");
    }
}
//# sourceMappingURL=projects.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/queued_processes.js


class QueuedProcesses extends BaseCollection {
    static rootElementName = "processes";
    static rootElementNameSingular = "process";
    static prefixURI = "projects/{!:project_id}/processes/{:id}";
    static elementClass = QueuedProcess;
    list(request_params) {
        return this.doList(request_params);
    }
    get(process_id, request_params) {
        return this.doGet(process_id, request_params);
    }
}
//# sourceMappingURL=queued_processes.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/screenshot.js

class Screenshot extends BaseModel {
}
//# sourceMappingURL=screenshot.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/screenshots.js


class Screenshots extends BaseCollection {
    static rootElementName = "screenshots";
    static rootElementNameSingular = "screenshot";
    static prefixURI = "projects/{!:project_id}/screenshots/{:id}";
    static elementClass = Screenshot;
    list(request_params) {
        return this.doList(request_params);
    }
    create(raw_body, request_params) {
        const body = { screenshots: this.objToArray(raw_body) };
        return this.doCreate(body, request_params, this.populateArrayFromJsonBulk);
    }
    get(screnshot_id, request_params) {
        return this.doGet(screnshot_id, request_params);
    }
    update(screenshot_id, screenshot_params, request_params) {
        return this.doUpdate(screenshot_id, screenshot_params, request_params);
    }
    delete(screenshot_id, request_params) {
        return this.doDelete(screenshot_id, request_params);
    }
}
//# sourceMappingURL=screenshots.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/segment.js

class Segment extends BaseModel {
}
//# sourceMappingURL=segment.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/segments.js


class Segments extends BaseCollection {
    static rootElementName = "segments";
    static rootElementNameSingular = "segment";
    static prefixURI = "projects/{!:project_id}/keys/{!:key_id}/segments/{!:language_iso}/{:id}";
    static elementClass = Segment;
    list(request_params) {
        return this.doList(request_params);
    }
    get(segment_number, request_params) {
        return this.doGet(segment_number, request_params);
    }
    update(segment_number, segment_params, request_params) {
        return this.doUpdate(segment_number, segment_params, request_params);
    }
}
//# sourceMappingURL=segments.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/snapshot.js

class Snapshot extends BaseModel {
}
//# sourceMappingURL=snapshot.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/snapshots.js


class Snapshots extends BaseCollection {
    static rootElementName = "snapshots";
    static rootElementNameSingular = "snapshot";
    static prefixURI = "projects/{!:project_id}/snapshots/{:id}";
    static elementClass = Snapshot;
    list(request_params) {
        return this.doList(request_params);
    }
    create(snapshot_params, request_params) {
        return this.doCreate(snapshot_params, request_params, this.populateObjectFromJsonRoot);
    }
    restore(snapshot_id, request_params) {
        const params = {
            ...request_params,
            ...{ id: snapshot_id },
        };
        return this.createPromise("POST", params, this.returnBareJSON, this.handleReject, {});
    }
    delete(snapshot_id, request_params) {
        return this.doDelete(snapshot_id, request_params);
    }
}
//# sourceMappingURL=snapshots.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/task.js

class Task extends BaseModel {
}
//# sourceMappingURL=task.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/tasks.js


class Tasks extends BaseCollection {
    static rootElementName = "tasks";
    static rootElementNameSingular = "task";
    static prefixURI = "projects/{!:project_id}/tasks/{:id}";
    static elementClass = Task;
    list(request_params) {
        return this.doList(request_params);
    }
    create(task_params, request_params) {
        return this.doCreate(task_params, request_params, this.populateObjectFromJsonRoot);
    }
    get(task_id, request_params) {
        return this.doGet(task_id, request_params);
    }
    update(task_id, task_params, request_params) {
        return this.doUpdate(task_id, task_params, request_params);
    }
    delete(task_id, request_params) {
        return this.doDelete(task_id, request_params);
    }
}
//# sourceMappingURL=tasks.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/team.js

class Team extends BaseModel {
}
//# sourceMappingURL=team.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/teams.js


class Teams extends BaseCollection {
    static rootElementName = "teams";
    static prefixURI = "teams";
    static elementClass = Team;
    list(request_params = {}) {
        return this.doList(request_params);
    }
}
//# sourceMappingURL=teams.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/team_user.js

class TeamUser extends BaseModel {
}
//# sourceMappingURL=team_user.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/team_users.js


class TeamUsers extends BaseCollection {
    static rootElementName = "team_users";
    static rootElementNameSingular = "team_user";
    static prefixURI = "teams/{!:team_id}/users/{:id}";
    static elementClass = TeamUser;
    list(request_params) {
        return this.doList(request_params);
    }
    get(team_user_id, request_params) {
        return this.doGet(team_user_id, request_params);
    }
    update(team_user_id, team_user_params, request_params) {
        return this.doUpdate(team_user_id, team_user_params, request_params);
    }
    delete(team_user_id, request_params) {
        return this.doDelete(team_user_id, request_params);
    }
}
//# sourceMappingURL=team_users.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/team_user_billing_details.js

class team_user_billing_details_TeamUserBillingDetails extends BaseModel {
}
//# sourceMappingURL=team_user_billing_details.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/team_user_billing_details.js


class TeamUserBillingDetails extends BaseCollection {
    static rootElementName = "";
    static prefixURI = "teams/{!:team_id}/billing_details";
    static elementClass = team_user_billing_details_TeamUserBillingDetails;
    get(team_id) {
        const params = { team_id: team_id };
        return this.createPromise("GET", params, this.populateObjectFromJson, this.handleReject, null);
    }
    create(billing_details_params, request_params) {
        return this.doCreate(billing_details_params, request_params);
    }
    update(team_id, billing_details_params) {
        const params = { team_id: team_id };
        return this.createPromise("PUT", params, this.populateObjectFromJson, this.handleReject, billing_details_params);
    }
}
//# sourceMappingURL=team_user_billing_details.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/translation.js

class Translation extends BaseModel {
}
//# sourceMappingURL=translation.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/translations.js


class Translations extends BaseCollection {
    static rootElementName = "translations";
    static rootElementNameSingular = "translation";
    static prefixURI = "projects/{!:project_id}/translations/{:id}";
    static elementClass = Translation;
    list(request_params) {
        return this.doList(request_params);
    }
    get(translation_id, request_params) {
        return this.doGet(translation_id, request_params);
    }
    update(translation_id, translation_params, request_params) {
        return this.doUpdate(translation_id, translation_params, request_params);
    }
}
//# sourceMappingURL=translations.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/translation_provider.js

class TranslationProvider extends BaseModel {
}
//# sourceMappingURL=translation_provider.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/translation_providers.js


class TranslationProviders extends BaseCollection {
    static rootElementName = "translation_providers";
    static prefixURI = "teams/{!:team_id}/translation_providers/{:id}";
    static elementClass = TranslationProvider;
    list(request_params) {
        return this.doList(request_params);
    }
    get(provider_id, request_params) {
        return this.doGet(provider_id, request_params);
    }
}
//# sourceMappingURL=translation_providers.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/translation_status.js

class TranslationStatus extends BaseModel {
}
//# sourceMappingURL=translation_status.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/translation_statuses.js


class TranslationStatuses extends BaseCollection {
    static rootElementName = "custom_translation_statuses";
    static prefixURI = "projects/{!:project_id}/custom_translation_statuses/{:id}";
    static elementClass = TranslationStatus;
    static rootElementNameSingular = "custom_translation_status";
    list(request_params) {
        return this.doList(request_params);
    }
    create(translation_status_params, request_params) {
        return this.doCreate(translation_status_params, request_params, this.populateObjectFromJsonRoot);
    }
    get(translation_status_id, request_params) {
        return this.doGet(translation_status_id, request_params);
    }
    update(translation_status_id, translation_status_params, request_params) {
        return this.doUpdate(translation_status_id, translation_status_params, request_params);
    }
    delete(translation_status_id, request_params) {
        return this.doDelete(translation_status_id, request_params);
    }
    available_colors(request_params) {
        return this.createPromise("GET", request_params, this.returnBareJSON, this.handleReject, {}, "projects/{!:project_id}/custom_translation_statuses/colors");
    }
}
//# sourceMappingURL=translation_statuses.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/user_group.js

class UserGroup extends BaseModel {
}
//# sourceMappingURL=user_group.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/user_groups.js


class UserGroups extends BaseCollection {
    static rootElementName = "user_groups";
    static prefixURI = "teams/{!:team_id}/groups/{:id}";
    static elementClass = UserGroup;
    list(request_params) {
        return this.doList(request_params);
    }
    create(user_group_params, request_params) {
        return this.doCreate(user_group_params, request_params, this.populateGroupFromJsonRoot);
    }
    get(user_group_id, request_params) {
        return this.doGet(user_group_id, request_params);
    }
    update(user_group_id, user_group_params, request_params) {
        return this.doUpdate(user_group_id, user_group_params, request_params, this.populateGroupFromJsonRoot);
    }
    delete(user_group_id, request_params) {
        return this.doDelete(user_group_id, request_params);
    }
    add_members_to_group(team_id, group_id, user_ids) {
        const params = {
            team_id: team_id,
            group_id: group_id,
        };
        const body = { users: user_ids };
        return this.createPromise("PUT", params, this.populateGroupFromJsonRoot, this.handleReject, body, "teams/{!:team_id}/groups/{!:group_id}/members/add");
    }
    remove_members_from_group(team_id, group_id, user_ids) {
        const params = {
            team_id: team_id,
            group_id: group_id,
        };
        const body = { users: user_ids };
        return this.createPromise("PUT", params, this.populateGroupFromJsonRoot, this.handleReject, body, "teams/{!:team_id}/groups/{!:group_id}/members/remove");
    }
    add_projects_to_group(team_id, group_id, project_ids) {
        const params = {
            team_id: team_id,
            group_id: group_id,
        };
        const body = { projects: project_ids };
        return this.createPromise("PUT", params, this.populateGroupFromJsonRoot, this.handleReject, body, "teams/{!:team_id}/groups/{!:group_id}/projects/add");
    }
    remove_projects_from_group(team_id, group_id, project_ids) {
        const params = {
            team_id: team_id,
            group_id: group_id,
        };
        const body = { projects: project_ids };
        return this.createPromise("PUT", params, this.populateGroupFromJsonRoot, this.handleReject, body, "teams/{!:team_id}/groups/{!:group_id}/projects/remove");
    }
    populateGroupFromJsonRoot(json, headers) {
        const formatted_json = json["group"];
        return this.populateObjectFromJson(formatted_json, headers);
    }
}
//# sourceMappingURL=user_groups.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/webhook.js

class Webhook extends BaseModel {
}
//# sourceMappingURL=webhook.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/collections/webhooks.js


class Webhooks extends BaseCollection {
    static rootElementName = "webhooks";
    static rootElementNameSingular = "webhook";
    static prefixURI = "projects/{!:project_id}/webhooks/{:id}";
    static elementClass = Webhook;
    list(request_params) {
        return this.doList(request_params);
    }
    create(webhook_params, request_params) {
        return this.doCreate(webhook_params, request_params, this.populateObjectFromJsonRoot);
    }
    get(webhook_id, request_params) {
        return this.doGet(webhook_id, request_params);
    }
    update(webhook_id, webhook_params, request_params) {
        return this.doUpdate(webhook_id, webhook_params, request_params);
    }
    delete(webhook_id, request_params) {
        return this.doDelete(webhook_id, request_params);
    }
    regenerate_secret(webhook_id, request_params) {
        const params = {
            ...request_params,
            ...{ id: webhook_id },
        };
        return this.createPromise("PATCH", params, this.returnBareJSON, this.handleReject, null, "projects/{!:project_id}/webhooks/{:id}/secret/regenerate");
    }
}
//# sourceMappingURL=webhooks.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/lokalise/lokalise_api.js
























class LokaliseApi extends BaseClient {
    constructor(params) {
        super(params);
        this.clientData.version = params.version ?? "api2";
    }
    branches() {
        return new Branches(this.clientData);
    }
    comments() {
        return new Comments(this.clientData);
    }
    contributors() {
        return new Contributors(this.clientData);
    }
    files() {
        return new Files(this.clientData);
    }
    jwt() {
        return new Jwt(this.clientData);
    }
    keys() {
        return new Keys(this.clientData);
    }
    languages() {
        return new Languages(this.clientData);
    }
    orders() {
        return new Orders(this.clientData);
    }
    paymentCards() {
        return new PaymentCards(this.clientData);
    }
    projects() {
        return new Projects(this.clientData);
    }
    queuedProcesses() {
        return new QueuedProcesses(this.clientData);
    }
    screenshots() {
        return new Screenshots(this.clientData);
    }
    segments() {
        return new Segments(this.clientData);
    }
    snapshots() {
        return new Snapshots(this.clientData);
    }
    tasks() {
        return new Tasks(this.clientData);
    }
    teams() {
        return new Teams(this.clientData);
    }
    teamUsers() {
        return new TeamUsers(this.clientData);
    }
    teamUserBillingDetails() {
        return new TeamUserBillingDetails(this.clientData);
    }
    translations() {
        return new Translations(this.clientData);
    }
    translationProviders() {
        return new TranslationProviders(this.clientData);
    }
    translationStatuses() {
        return new TranslationStatuses(this.clientData);
    }
    userGroups() {
        return new UserGroups(this.clientData);
    }
    webhooks() {
        return new Webhooks(this.clientData);
    }
}
//# sourceMappingURL=lokalise_api.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/lokalise/lokalise_api_oauth.js

class LokaliseApiOAuth extends LokaliseApi {
    constructor(params) {
        super(params);
        const tokenType = params["tokenType"];
        this.clientData.tokenType = tokenType ?? "Bearer";
        this.clientData.authHeader = "Authorization";
    }
}
//# sourceMappingURL=lokalise_api_oauth.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/ota_collections/ota_collection.js

class OtaCollection extends BaseCollection {
    populateApiErrorFromJson(json) {
        return json;
    }
    doDelete(id, req_params) {
        const params = {
            ...req_params,
            id,
        };
        return this.createPromise("DELETE", params, this.returnJSONFromData, this.handleReject, null);
    }
    returnJSONFromData(json) {
        return json["data"];
    }
}
//# sourceMappingURL=ota_collection.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/ota_sdk_token.js

class OtaSdkToken extends BaseModel {
}
//# sourceMappingURL=ota_sdk_token.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/ota_collections/ota_sdk_tokens.js


class OtaSdkTokens extends OtaCollection {
    static rootElementName = "data";
    static rootElementNameSingular = "data";
    static prefixURI = "teams/{!:teamId}/projects/{!:lokaliseProjectId}/tokens/{:id}";
    static elementClass = OtaSdkToken;
    list(request_params) {
        return this.doList(request_params);
    }
    create(request_params) {
        return this.doCreate(null, request_params, this.populateObjectFromJsonRoot);
    }
    delete(tokenId, request_params) {
        return this.doDelete(tokenId, request_params);
    }
}
//# sourceMappingURL=ota_sdk_tokens.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/ota_bundle.js

class OtaBundle extends BaseModel {
}
//# sourceMappingURL=ota_bundle.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/ota_collections/ota_bundle_management.js


class OtaBundleManagement extends OtaCollection {
    static rootElementName = "data";
    static rootElementNameSingular = "data";
    static prefixURI = "teams/{!:teamId}/projects/{!:lokaliseProjectId}/bundles/{:id}";
    static elementClass = OtaBundle;
    list(request_params) {
        return this.doList(request_params);
    }
    get(bundleId, requestParams) {
        return this.doGet(bundleId, requestParams);
    }
    update(bundleId, bundleParams, requestParams) {
        return this.doUpdate(bundleId, bundleParams, requestParams, this.populateObjectFromJsonRoot, "PATCH");
    }
    delete(bundleId, requestParams) {
        return this.doDelete(bundleId, requestParams);
    }
}
//# sourceMappingURL=ota_bundle_management.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/ota_collections/ota_bundle_publishing.js

class OtaBundlePublishing extends OtaCollection {
    static prefixURI = "teams/{!:teamId}/projects/{!:lokaliseProjectId}/frameworks/{!:framework}/{!:action}";
    publish(bundleId, request_params) {
        const params = {
            ...request_params,
            ...{ action: "publish" },
        };
        return this.createPromise("POST", params, null, this.handleReject, {
            bundleId,
        });
    }
    stage(bundleId, request_params) {
        const params = {
            ...request_params,
            ...{ action: "stage" },
        };
        return this.createPromise("POST", params, null, this.handleReject, {
            bundleId,
        });
    }
}
//# sourceMappingURL=ota_bundle_publishing.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/ota_statistics.js

class OtaStatistics extends BaseModel {
}
//# sourceMappingURL=ota_statistics.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/ota_collections/ota_usage_statistics.js


class OtaUsageStatistics extends OtaCollection {
    static prefixURI = "teams/{!:teamId}/projects/{!:lokaliseProjectId}/stats";
    static elementClass = OtaStatistics;
    get(bundle_params, request_params) {
        const params = {
            ...request_params,
            ...bundle_params,
        };
        return this.createPromise("GET", params, this.populateObjectFromJson, this.handleReject, null);
    }
}
//# sourceMappingURL=ota_usage_statistics.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/ota_freeze_period.js

class OtaFreezePeriod extends BaseModel {
}
//# sourceMappingURL=ota_freeze_period.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/ota_collections/ota_freeze_periods.js


class OtaFreezePeriods extends OtaCollection {
    static rootElementName = "data";
    static rootElementNameSingular = "data";
    static prefixURI = "teams/{!:teamId}/projects/{!:lokaliseProjectId}/bundle-freezes/{:id}";
    static elementClass = OtaFreezePeriod;
    list(requestParams) {
        return this.doList(requestParams);
    }
    create(freezeParams, requestParams) {
        return this.doCreate(freezeParams, requestParams, this.populateObjectFromJsonRoot);
    }
    update(freezeId, freezeParams, requestParams) {
        return this.doUpdate(freezeId, freezeParams, requestParams);
    }
    delete(freezeId, requestParams) {
        return this.doDelete(freezeId, requestParams);
    }
}
//# sourceMappingURL=ota_freeze_periods.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/lokalise/lokalise_api_ota.js






class LokaliseApiOta extends BaseClient {
    constructor(params) {
        super(params);
        this.clientData.tokenType = params["tokenType"] ?? "Bearer";
        this.clientData.authHeader = "Authorization";
        this.clientData.host = this.clientData.host ?? "https://ota.lokalise.com";
        this.clientData.version = params.version ?? "v3";
    }
    otaBundleManagement() {
        return new OtaBundleManagement(this.clientData);
    }
    otaBundlePublishing() {
        return new OtaBundlePublishing(this.clientData);
    }
    otaUsageStatistics() {
        return new OtaUsageStatistics(this.clientData);
    }
    otaFreezePeriods() {
        return new OtaFreezePeriods(this.clientData);
    }
    otaSdkTokens() {
        return new OtaSdkTokens(this.clientData);
    }
}
//# sourceMappingURL=lokalise_api_ota.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/models/ota_bundle_archive.js

class OtaBundleArchive extends BaseModel {
}
//# sourceMappingURL=ota_bundle_archive.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/ota_collections/ota_bundles.js


class OtaBundles extends OtaCollection {
    static rootElementNameSingular = "data";
    static prefixURI = "lokalise/projects/{!:lokaliseProjectId}/frameworks/{!:framework}";
    static elementClass = OtaBundleArchive;
    get(bundle_params, request_params) {
        const params = {
            ...request_params,
            ...bundle_params,
        };
        return this.createPromise("GET", params, this.populateObjectFromJsonRoot, this.handleReject, null);
    }
}
//# sourceMappingURL=ota_bundles.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/lokalise/lokalise_ota_bundles.js


class LokaliseOtaBundles extends BaseClient {
    constructor(params) {
        super(params);
        this.clientData.authHeader = "x-ota-api-token";
        this.clientData.host = this.clientData.host ?? "https://ota.lokalise.com";
        this.clientData.version = params.version ?? "v3";
    }
    otaBundles() {
        return new OtaBundles(this.clientData);
    }
}
//# sourceMappingURL=lokalise_ota_bundles.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/oauth2/auth_request.js

class AuthRequest {
    static async createPromise(uri, method, body, clientData) {
        const prefixUrl = clientData.host;
        uri = `/${clientData.version}/${uri}`;
        const options = {
            method: method,
            headers: {
                Accept: "application/json",
                "User-Agent": `node-lokalise-api/${await LokalisePkg.getVersion()}`,
                "Content-type": "application/json",
            },
            body: JSON.stringify(body),
        };
        const target = new URL(uri, prefixUrl);
        try {
            const response = await fetch(target, options);
            const responseJSON = await response.json();
            if (response.ok) {
                return Promise.resolve({
                    json: responseJSON,
                    headers: response.headers,
                });
            }
            return Promise.reject({
                ...{ code: response.status },
                ...responseJSON,
            });
        }
        catch (err) {
            return Promise.reject({ message: err.message });
        }
    }
}
//# sourceMappingURL=auth_request.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/oauth2/lokalise_auth.js

class LokaliseAuth {
    authData = {
        client_id: "",
        client_secret: "",
    };
    /*
     * Instantiate LokaliseAuth to work with OAuth 2 tokens
     * @param clientId      string, mandatory
     * @param clientSecret  string, mandatory
     * @returns             LokaliseAuth object to work with.
     */
    constructor(clientId, clientSecret, host, version) {
        if (clientId == null ||
            clientId.length == 0 ||
            clientSecret == null ||
            clientSecret.length == 0) {
            throw new Error("Error: Instantiation failed: Please pass client id and client secret");
        }
        this.authData.client_id = clientId;
        this.authData.client_secret = clientSecret;
        this.authData.host = host ?? "https://app.lokalise.com";
        this.authData.version = version ?? "oauth2";
    }
    auth(scope, redirect_uri, state) {
        if (scope instanceof Array) {
            scope = scope.join(" ");
        }
        const params = {
            client_id: this.authData.client_id,
            scope: scope,
        };
        if (state) {
            params["state"] = state;
        }
        if (redirect_uri) {
            params["redirect_uri"] = redirect_uri;
        }
        return this.buildUrl(params);
    }
    async token(code) {
        const params = {
            ...this.base_params(),
            ...{
                code: code,
                grant_type: "authorization_code",
            },
        };
        return await this.doRequest(params);
    }
    async refresh(refresh_token) {
        const params = {
            ...this.base_params(),
            ...{
                refresh_token: refresh_token,
                grant_type: "refresh_token",
            },
        };
        return await this.doRequest(params);
    }
    async doRequest(params) {
        try {
            const data = await AuthRequest.createPromise("token", "POST", params, this.authData);
            return Promise.resolve(data["json"]);
        }
        catch (err) {
            return Promise.reject(this.handleReject(err));
        }
    }
    buildUrl(params) {
        const url = new URL("auth", this.authData.host);
        const sParams = new URLSearchParams(params);
        url.search = sParams.toString();
        return url.toString();
    }
    base_params() {
        return {
            client_id: this.authData.client_id,
            client_secret: this.authData.client_secret,
        };
    }
    handleReject(data) {
        return data;
    }
}
//# sourceMappingURL=lokalise_auth.js.map
;// CONCATENATED MODULE: ./node_modules/@lokalise/node-api/dist/main.js








//# sourceMappingURL=main.js.map

/***/ })

};
;