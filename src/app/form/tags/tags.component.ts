import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { some } from 'lodash-es';
import { AdminService } from '../../service/admin.service';
import { TAG_REGEX } from '../../util/format';
import { hasPrefix, hasTag } from '../../util/tag';

@Component({
  standalone: false,
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsFormComponent implements OnChanges {
  static validators = [Validators.pattern(TAG_REGEX)];
  @HostBinding('class') css = 'form-group';

  @Input()
  origin? = '';
  @Input()
  group?: UntypedFormGroup;
  @Input()
  fieldName = 'tags';

  field = {
    type: 'tags',
    props: {
      showLabel: true,
      label: $localize`Tags: `,
      showAdd: true,
      addText: $localize`+ Add another tag`,
    },
    fieldArray: {
      focus: false,
      props: {
        label: $localize`🏷️`,
      } as any,
    },
  };

  constructor(
    private admin: AdminService,
    private fb: FormBuilder,
  ) {  }

  ngOnChanges(changes: SimpleChanges) {
    this.field.fieldArray.props.origin = this.origin;
  }

  @Input()
  set emoji(value: string) {
    this.field.fieldArray.props.label = value;
  }

  @Input()
  set label(value: string) {
    this.field.props.label = value;
  }

  @Input()
  set showLabel(value: boolean) {
    this.field.props.showLabel = value;
  }

  @Input()
  set add(value: string) {
    this.field.props.addText = value;
  }

  @Input()
  set showAdd(value: boolean) {
    this.field.props.showAdd = value;
  }

  get tags() {
    return this.group?.get(this.fieldName) as UntypedFormArray;
  }

  get model() {
    return this.tags.value;
  }

  setTags(values: string[]) {
    if (!this.tags) throw 'Not ready yet!';
    while (this.tags.length > values.length) this.tags.removeAt(this.tags.length - 1, { emitEvent: false });
    while (this.tags.length < values.length) this.tags.push(this.fb.control(''), { emitEvent: false });
    this.tags.setValue(values);
  }

  addTag(...values: string[]) {
    if (!this.tags) throw 'Not ready yet!';
    if (!values.length) return;
    this.field.fieldArray.focus = true;
    for (const value of values) {
      if (value) this.field.fieldArray.focus = false;
      if (value && value !== 'placeholder' && this.tags.value.includes(value)) return;
    }
    this.setTags([...this.tags.value, ...values]);
  }

  get editingViewer() {
    if (!this.tags?.value) return false;
    return some(this.admin.editingViewer, t => hasTag(t.tag, this.tags!.value));
  }

  removeTagAndChildren(tag: string) {
    if (!this.tags) throw 'Not ready yet!';
    let removed = false;
    for (let i = this.tags.value.length - 1; i >= 0; i--) {
      if (hasPrefix(this.tags.value[i], tag)) {
        this.tags.removeAt(i);
        removed = true;
      }
    }
    if (removed && tag.includes('/')) {
      const parent = tag.substring(0, tag.lastIndexOf('/'));
      if (!hasTag(parent, this.tags.value)) this.addTag(parent);
    }
  }
}
