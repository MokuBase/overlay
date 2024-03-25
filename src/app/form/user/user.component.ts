import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { User } from '../../model/user';
import { isMailbox } from '../../mods/mailbox';
import { USER_REGEX } from '../../util/format';
import { TagsFormComponent } from '../tags/tags.component';

@Component({
  selector: 'app-user-form',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserFormComponent implements OnInit {
  @HostBinding('class') css = 'nested-form';

  @Input()
  group!: UntypedFormGroup;
  @Input()
  fillWidth?: HTMLElement;
  @Output()
  tagChanges = new EventEmitter<string>();
  @Input()
  showClear = false;
  @Output()
  clear = new EventEmitter<void>();

  @ViewChild('fill')
  fill?: ElementRef;

  @ViewChild('notifications')
  notifications!: TagsFormComponent;
  @ViewChild('readAccess')
  readAccess!: TagsFormComponent;
  @ViewChild('writeAccess')
  writeAccess!: TagsFormComponent;
  @ViewChild('tagReadAccess')
  tagReadAccess!: TagsFormComponent;
  @ViewChild('tagWriteAccess')
  tagWriteAccess!: TagsFormComponent;

  ngOnInit(): void {
  }

  get tag() {
    return this.group.get('tag') as UntypedFormControl;
  }

  validate(input: HTMLInputElement) {
    if (this.tag.touched) {
      if (this.tag.errors?.['required']) {
        input.setCustomValidity($localize`Tag must not be blank.`);
        input.reportValidity();
      }
      if (this.tag.errors?.['pattern']) {
        input.setCustomValidity($localize`
          User tags must start with the "+user/" or "_user/" prefix.
          Tags must be lower case letters and forward slashes. Must not start with a slash or contain two forward slashes in a row. Private
          tags start with an underscore.
          (i.e. "+user/alice", "_user/bob", or "+user/department/charlie")`);
        input.reportValidity();
      }
    }
    if (!this.tag.errors) {
      this.tagChanges.next(input.value)
    }
  }

  setUser(user: User) {
    const ns = (user.readAccess || []).filter(isMailbox);
    this.notifications.model = ns;
    const ra = (user.readAccess || []).filter(t => !isMailbox(t));
    this.readAccess.model = ra;
    this.writeAccess.model = [...user.writeAccess || []];
    this.tagReadAccess.model = [...user.tagReadAccess || []];
    this.tagWriteAccess.model = [...user.tagWriteAccess || []];
    this.group.patchValue({
      ...user,
      notifications: ns,
      readAccess: ra,
    });
  }

}

export function userForm(fb: UntypedFormBuilder, locked = false) {
  return fb.group({
    tag: [{value: '', disabled: locked}, [Validators.required, Validators.pattern(USER_REGEX)]],
    name: [''],
    role: [''],
    notifications: fb.array([]),
    readAccess: fb.array([]),
    writeAccess: fb.array([]),
    tagReadAccess: fb.array([]),
    tagWriteAccess: fb.array([]),
    pubKey: [''],
  });
}
