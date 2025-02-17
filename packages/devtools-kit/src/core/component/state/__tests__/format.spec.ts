import * as format from '../format'
import { INFINITY, NAN, NEGATIVE_INFINITY, UNDEFINED } from '../constants'

describe('format: displayText and rawValue can be calculated by formatInspectorStateValue, getRawValue', () => {
  describe('type: literals', () => {
    // eslint-disable-next-line test/consistent-test-it
    test.each([
      { literal: 'test-string', displayText: 'test-string' },
      { literal: 123, displayText: 123 },
      { literal: true, displayText: true },
      { literal: null, displayText: 'null' },
      // Tokenlized values
      { literal: INFINITY, displayText: 'Infinity' },
      { literal: NAN, displayText: 'NaN' },
      { literal: NEGATIVE_INFINITY, displayText: '-Infinity' },
      { literal: UNDEFINED, displayText: 'undefined' },
    ])('type: %s', (value) => {
      const displayText = format.formatInspectorStateValue(value.literal)
      const rawValue = format.getRawValue(value.literal).value

      expect(displayText).toBe(value.displayText)
      expect(rawValue).toBe(value.literal)
    })
  })

  it('type: plain object', () => {
    const value = { foo: 'bar' }
    const displayText = format.formatInspectorStateValue(value)
    const rawValue = format.getRawValue(value).value

    expect(displayText).toBe('Object')
    expect(rawValue).toEqual(value)
  })

  it('type: array', () => {
    const value = ['foo', { bar: 'baz' }]
    const displayText = format.formatInspectorStateValue(value)
    const rawValue = format.getRawValue(value).value

    expect(displayText).toBe('Array[2]')
    expect(rawValue).toEqual(value)
  })

  describe('type: custom', () => {
    it('type: common custom', () => {
      const value = { _custom: { displayText: 'custom-display', value: Symbol(123) } }
      const displayText = format.formatInspectorStateValue(value)
      const rawValue = format.getRawValue(value).value

      expect(displayText).toBe(value._custom.displayText)
      expect(rawValue).toEqual(value._custom.value)
    })

    it('type: nested custom', () => {
      const value = {
        _custom: {
          displayText: 'custom-display',
          value: {
            _custom: { displayText: 'nested-custom-display', value: Symbol(123) },
          },
        },
      }

      const displayText = format.formatInspectorStateValue(value)
      const rawValue = format.getRawValue(value).value

      expect(displayText).toBe(value._custom.value._custom.displayText)
      expect(rawValue).toEqual(value._custom.value._custom.value)
    })
  })
})

describe('format: toEdit', () => {
  // eslint-disable-next-line test/consistent-test-it
  test.each([
    { value: 123, target: '123' },
    { value: 'string-value', target: '"string-value"' },
    { value: true, target: 'true' },
    { value: null, target: 'null' },
    // Tokenlized values
    { value: INFINITY, target: 'Infinity' },
    { value: NAN, target: 'NaN' },
    { value: NEGATIVE_INFINITY, target: '-Infinity' },
    { value: UNDEFINED, target: 'undefined' },
    // Object that has tokenlized values
    { value: { foo: INFINITY }, target: '{"foo":Infinity}' },
    { value: { foo: NAN }, target: '{"foo":NaN}' },
    { value: { foo: NEGATIVE_INFINITY }, target: '{"foo":-Infinity}' },
    { value: { foo: UNDEFINED }, target: '{"foo":undefined}' },
  ])('value: $value will be deserialized to target', (value) => {
    const deserialized = format.toEdit(value.value)
    expect(deserialized).toBe(value.target)
  })
})

describe('format: toSubmit', () => {
  // eslint-disable-next-line test/consistent-test-it
  test.each([
    { value: '123', target: 123 },
    { value: '"string-value"', target: 'string-value' },
    { value: 'true', target: true },
    { value: 'null', target: null },
    // Tokenlized values
    { value: 'Infinity', target: Number.POSITIVE_INFINITY },
    { value: 'NaN', target: Number.NaN },
    { value: '-Infinity', target: Number.NEGATIVE_INFINITY },
    { value: 'undefined', target: undefined },
    // // Object that has tokenlized values
    { value: '{"foo":Infinity}', target: { foo: Number.POSITIVE_INFINITY } },
    { value: '{"foo":NaN}', target: { foo: Number.NaN } },
    { value: '{"foo":-Infinity}', target: { foo: Number.NEGATIVE_INFINITY } },
    // when serializing { key: undefined }, the key will be removed.
    { value: '{"foo":undefined}', target: {} },
    // Regex test: The token in key field kept untouched.
    { value: '{"undefined": NaN }', target: { undefined: Number.NaN } },
  ])('value: $value will be serialized to target', (value) => {
    const serialized = format.toSubmit(value.value)
    expect(serialized).toStrictEqual(value.target)
  })
})
