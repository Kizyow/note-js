function Note(titre, contenu) {
    this.titre = titre;
    this.contenu = contenu;
    this.date_creation = new Date();
}

Note.prototype.setTitre = function (titre) {
    this.titre = titre;
}

Note.prototype.setContenu = function (contenu) {
    this.contenu = contenu;
}

Note.prototype.setDate = function (date) {
    this.date = new Date(date);
}

function NoteView(note) {
    this.note = note;
}

NoteView.prototype.toHtml = function () {
    let conv = new showdown.Converter();
    let titreMarkdown = conv.makeHtml(`# ${this.note.titre}`);
    let contenuMarkdown = conv.makeHtml(this.note.contenu);
    return `${titreMarkdown} ${contenuMarkdown}`;
}

NoteView.prototype.afficherNoteCourante = function () {
    let currentNoteView = document.getElementById("currentNoteView");
    currentNoteView.innerHTML = this.toHtml();
}

let noteFormView = {
    display() {
        if(app.edit){
            document.getElementById("form_add_note_title").value = app.listeNotes.getNoteById(app.noteCourante).titre;
            document.getElementById("form_add_note_text").value =  app.listeNotes.getNoteById(app.noteCourante).contenu;
        }
        let noteForm = document.getElementById("noteForm");
        noteForm.classList.remove("create_edit_note-hidden");
    },
    hide() {
        let noteForm = document.getElementById("noteForm");
        noteForm.classList.add("create_edit_note-hidden");
    },
    validate() {
        noteFormView.hide();
        let formTitreValue = document.getElementById("form_add_note_title").value;
        let formContenuValue = document.getElementById("form_add_note_text").value;

        let note = new Note(formTitreValue, formContenuValue)
        if (app.edit) {
            note = app.listeNotes.editNote(app.noteCourante, formTitreValue, formContenuValue);
            noteListMenuView.reload();
            app.edit = false;
        } else {
            app.noteCourante = app.listeNotes.addNote(note);
            noteListMenuView.displayItem(note, app.noteCourante);
        }
        let noteView = new NoteView(note);
        noteView.afficherNoteCourante();
        app.listeNotes.save();
    }
};

function NoteList() {
    this.liste = [];
}

NoteList.prototype.addNote = function (note) {
    return this.liste.push(note) - 1;
}

NoteList.prototype.editNote = function (index, titre, contenu) {
    let note = this.getNoteById(index);
    note.setTitre(titre);
    note.setContenu(contenu);
    return note;
}

NoteList.prototype.getNoteById = function (id) {
    return this.liste[id];
}

NoteList.prototype.getList = function () {
    return this.liste;
}

NoteList.prototype.save = function () {
    let json = JSON.stringify(this.liste);
    localStorage.setItem("liste", json);
}

NoteList.prototype.load = function () {
    let json = localStorage.getItem("liste");
    if (json !== null) {
        let parsed = JSON.parse(json);
        parsed.forEach(e => {
            let note = new Note(e.titre, e.contenu);
            note.setDate(e.date_creation);
            app.listeNotes.addNote(note);
        });
    }
}

NoteList.prototype.delete = function (index) {
    this.liste.splice(index, 1);
}

let noteListMenuView = {
    displayItem(note, id) {
        let noteListMenu = document.getElementById("noteListMenu");
        let div = document.createElement("div");
        div.setAttribute("class", "note_list_item");
        let para = document.createElement("p");
        para.setAttribute("id", `${id}`);
        let text = document.createTextNode(`${note.titre} ${note.date_creation.toLocaleString('fr-FR', {timeZone: 'UTC'})}`);
        para.appendChild(text);
        div.appendChild(para);
        noteListMenu.appendChild(div);
    },
    selectItem(event) {
        let target = event.target;
        if (target.nodeName === "SECTION") {
            return;
        } else if (target.nodeName === "DIV") {
            target = target.firstElementChild;
        }
        noteListMenuView.unselectItem();
        app.noteCourante = parseInt(target.id);
        let note = app.listeNotes.getNoteById(app.noteCourante);
        let noteItem = document.getElementById(app.noteCourante).parentNode;
        noteItem.classList.add("note_list_item-selected");
        let noteView = new NoteView(note);
        noteView.afficherNoteCourante();
    },
    unselectItem() {
        let noteItems = document.getElementsByClassName("note_list_item-selected");
        Array.prototype.forEach.call(noteItems, noteItem => {
            noteItem.classList.remove("note_list_item-selected");
        });
    },
    displayItems(notes) {
        for (let i = 0; i < notes.length; i++) {
            this.displayItem(notes[i], i);
        }
    },
    removeItem(index) {
        if (app.noteCourante === -1) return;

        let currentNoteView = document.getElementById("currentNoteView");
        currentNoteView.innerHTML = "";

        app.listeNotes.delete(index);
        app.listeNotes.save();

        this.reload();
    },
    reload() {
        let noteListMenu = document.getElementById("noteListMenu");
        noteListMenu.innerHTML = "";
        this.displayItems(app.listeNotes.getList());
    }
}

let mainMenuView = {
    addHandler() {
        noteFormView.display();
    },
    init() {
        app.listeNotes.load();
        noteListMenuView.displayItems(app.listeNotes.getList());
        let add = document.getElementById("add");
        add.addEventListener('click', this.addHandler)
        let validate = document.getElementById("form_add_note_valid");
        validate.addEventListener('click', noteFormView.validate);
        let noteListMenu = document.getElementById("noteListMenu");
        noteListMenu.addEventListener('click', noteListMenuView.selectItem);
        let del = document.getElementById("del");
        del.addEventListener('click', () => {
            noteListMenuView.removeItem(app.noteCourante);
            app.noteCourante = -1;
        });
        let edit = document.getElementById("edit");
        edit.addEventListener('click', () => {
            app.edit = true;
            noteFormView.display();
        });
    }
};

let app = {
    listeNotes: new NoteList(),
    noteCourante: undefined,
    edit: false,
    init() {
        mainMenuView.init();
    }
};

window.addEventListener('DOMContentLoaded', app.init);