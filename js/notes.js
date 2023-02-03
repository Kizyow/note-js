function Note(titre, contenu){
    this.titre = titre;
    this.contenu = contenu;
    this.date_creation = new Date();
}

Note.prototype.setTitre = function(titre){
    this.titre = titre;
}

Note.prototype.setContenu = function(contenu){
    this.contenu = contenu;
}

function NoteView(note){
    this.note = note;
}

NoteView.prototype.toHtml = function(){
    let conv = new showdown.Converter();
    let titreMarkdown = conv.makeHtml(`# ${this.note.titre}`);
    let contenuMarkdown = conv.makeHtml(this.note.contenu);
    return `${titreMarkdown} ${contenuMarkdown}`;
}

NoteView.prototype.afficherNoteCourante = function(){
    let currentNoteView = document.getElementById("currentNoteView");
    currentNoteView.innerHTML = this.toHtml();
}

let noteFormView = {
    display(){
        let noteForm = document.getElementById("noteForm");
        noteForm.classList.remove("create_edit_note-hidden");
    },
    hide(){
        let noteForm = document.getElementById("noteForm");
        noteForm.classList.add("create_edit_note-hidden");
    },
    validate(){
        noteFormView.hide();
        let formTitreValue = document.getElementById("form_add_note_title").value;
        let formContenuValue = document.getElementById("form_add_note_text").value;
        let note = new Note(formTitreValue, formContenuValue);
        let noteView = new NoteView(note);
        noteView.afficherNoteCourante();
        app.noteCourante = app.listeNotes.addNote(note);
        noteListMenuView.displayItem(note);
    }

};

function NoteList(){
    this.liste = [];
}

NoteList.prototype.addNote = function (note){
    return this.liste.push(note) - 1;
}

NoteList.prototype.getNoteById = function (id){
    return this.liste[id];
}

NoteList.prototype.getList = function (){
    return this.liste;
}

let noteListMenuView = {
    displayItem(note){
        let noteListMenu = document.getElementById("noteListMenu");
        let div = document.createElement("div");
        div.setAttribute("class", "note_list_item");
        let para = document.createElement("p");
        para.setAttribute("id", `${app.listeNotes.liste.length-1}`);
        let text = document.createTextNode(`${note.titre} ${note.date_creation.toLocaleString('fr-FR', {timeZone: 'UTC'})}`);
        para.appendChild(text);
        div.appendChild(para);
        noteListMenu.appendChild(div);
    },
    selectItem(event){
        let target = event.target;
        if(target.nodeName === "SECTION"){
            return;
        } else if(target.nodeName === "DIV"){
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
    unselectItem(){
        let noteItems = document.getElementsByClassName("note_list_item-selected");
        Array.prototype.forEach.call(noteItems, noteItem => {
            noteItem.classList.remove("note_list_item-selected");
        });
    }
}

let mainMenuView = {
    addHandler(){
        noteFormView.display();
    },
    init(){
        let add = document.getElementById("add");
        add.addEventListener('click', this.addHandler)
        let validate = document.getElementById("form_add_note_valid");
        validate.addEventListener('click', noteFormView.validate);
        let noteListMenu = document.getElementById("noteListMenu");
        noteListMenu.addEventListener('click', noteListMenuView.selectItem);
    }
};

let app = {
    listeNotes : new NoteList(),
    noteCourante : undefined,
    init(){
        mainMenuView.init();
    }
};

window.addEventListener('DOMContentLoaded', app.init);