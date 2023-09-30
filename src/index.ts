import { type Auth, connectAuthEmulator } from "firebase/auth"
import { type Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { type Functions, connectFunctionsEmulator } from "firebase/functions"

export interface DebuggableFirebaseConfig {
    useDebugger: boolean,
    firestore: {
        host: string,
        port: number,
    },
    auth: {
        url: string,
    },
    functions: {
        host: string,
        port: number,
    },
}

export type DebuggableFirebaseConstructorOptions = Partial<DebuggableFirebaseConfig>

export interface FirebaseGetters {
    firestore(): Firestore
    auth(): Auth
    functions(): Functions
}

export default class DebuggableFirebase {
    private readonly options: DebuggableFirebaseConfig
    private readonly getters: FirebaseGetters

    constructor(getters: FirebaseGetters, options?: DebuggableFirebaseConstructorOptions) {
        this.getters = getters
        this.options = {
            useDebugger: options?.useDebugger ?? process.env.NODE_ENV === "development",
            firestore: options?.firestore ?? {
                host: "127.0.0.1",
                port: 8080,
            },
            auth: options?.auth ?? {
                url: "http://127.0.0.1:9099",
            },
            functions: options?.functions ?? {
                host: "127.0.0.1",
                port: 5001,
            },
        }
    }

    private get useDebugger() {
        return this.options.useDebugger
    }

    private firestore?: Firestore
    private auth?: Auth
    private functions?: Functions

    getConfiguredFirestore() {
        if (this.firestore) return this.firestore
        this.firestore = this.getters.firestore()
        if (this.useDebugger) connectFirestoreEmulator(this.firestore, this.options.firestore.host, this.options.firestore.port)
        return this.firestore
    }

    getConfiguredAuth() {
        if (this.auth) return this.auth
        this.auth = this.getters.auth()
        if (this.useDebugger) connectAuthEmulator(this.auth, this.options.auth.url)
        return this.auth
    }

    getConfiguredFunctions() {
        if (this.functions) return this.functions
        this.functions = this.getters.functions()
        if (this.useDebugger) connectFunctionsEmulator(this.functions, this.options.functions.host, this.options.functions.port)
        return this.functions
    }
}
