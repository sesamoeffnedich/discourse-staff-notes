import { default as computed, on } from 'ember-addons/ember-computed-decorators';
import { popupAjaxError } from 'discourse/lib/ajax-error';

const StaffNotesController = Ember.Controller.extend({
  newNote: null,
  saving: false,

  @on('init')
  reset() {
    this.setProperties({ newNote: null, saving: false });
  },

  @computed('newNote', 'saving')
  attachDisabled(newNote, saving) {
    return saving || !newNote || (newNote.length === 0);
  },

  actions: {
    attachNote() {
      const note = this.store.createRecord('staff-note');
      const userId = parseInt(this.get('userId'));

      this.set('saving', true);
      note.save({ raw: this.get('newNote'), user_id: userId }).then(() => {
        this.set('newNote', '');
        this.get('model').pushObject(note);
        StaffNotesController.noteCount[userId] = (StaffNotesController.noteCount[userId] || 0) + 1;
        this.appEvents.trigger('post-stream:refresh', { force: true });
      }).catch(popupAjaxError).finally(() => this.set('saving', false));
    },

    removeNote(note) {
      note.destroyRecord().then(() => { 
        const notes = this.get('model');
        notes.removeObject(note);
        StaffNotesController.noteCount[parseInt(note.get('user_id'))] = notes.get('length');
        this.appEvents.trigger('post-stream:refresh', { force: true });
      });
    }
  }
});

StaffNotesController.reopenClass({
  noteCount: {}
});

export default StaffNotesController;
