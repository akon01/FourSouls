

export default class ActionMessage {

    private _text: string;

    set text(text: string) {
        this._text = text
    }

    get text() {
        return this._text
    }

    private _id: number

    set id(id: number) {
        this._id = id
    }

    get id() {
        return this._id
    }

    constructor(id: number, text: string) {
        this._id = id
        this._text = text
    }

    isRemoved: boolean


}
