import React from 'react'
import { render, findAllByText, fireEvent } from '@testing-library/react'
import TimezoneSelect, { allTimezones } from '../../dist/cjs/index.js'

// react-select react-testing-library jest example tests:
// https://github.com/JedWatson/react-select/blob/master/packages/react-select/src/__tests__/Select.test.js

test('snapshot - defaults', () => {
  const { container } = render(<TimezoneSelect value={''} onChange={e => e} />)
  expect(container).toMatchSnapshot()
})

test('loads and displays default timezone - passing string', async () => {
  const { getByText } = render(
    <TimezoneSelect value={'Europe/Amsterdam'} onChange={e => e} />
  )

  expect(
    getByText(
      /\(UTC\+[1-2]:00\) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna$/
    )
  ).toBeInTheDocument()
})

test('loads and displays default timezone - passing full object', async () => {
  const { getByText } = render(
    <TimezoneSelect
      value={{
        value: 'Europe/Amsterdam',
        label: '(UTC+1:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
      }}
      onChange={e => e}
    />
  )

  expect(
    getByText(
      /\(UTC\+[1-2]:00\) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna$/
    )
  ).toBeInTheDocument()
})

test('load and displays labelStyle - altName', async () => {
  const { getByText } = render(
    <TimezoneSelect
      value={'America/Juneau'}
      labelStyle="altName"
      onChange={e => e}
    />
  )

  expect(
    getByText(/\(UTC-[8-9]:00\) Alaska \(Alaska (Daylight|Standard) Time\)$/)
  ).toBeInTheDocument()
})

test('load and displays labelStyle - abbrev', async () => {
  const { getByText } = render(
    <TimezoneSelect
      value={'America/Juneau'}
      labelStyle="abbrev"
      onChange={e => e}
    />
  )

  expect(getByText(/\(UTC-[8-9]:00\) Alaska \(AK[D|S]T\)$/)).toBeInTheDocument()
})

test('load and displays custom timezone', async () => {
  const { getByText } = render(
    <TimezoneSelect
      value={'America/Lima'}
      timezones={{
        ...allTimezones,
        'America/Lima': 'Pittsburgh',
      }}
      onChange={e => e}
    />
  )

  expect(getByText(/\(UTC-[5-6]:00\) Pittsburgh$/)).toBeInTheDocument()
})

test('load and displays only 2 custom timezone choices', async () => {
  const { container } = render(
    <TimezoneSelect
      value={''}
      timezones={{
        'America/Lima': 'Pittsburgh',
        'Europe/Berlin': 'Frankfurt',
      }}
      menuIsOpen={true}
      onChange={e => e}
    />
  )

  const items = await findAllByText(container, /^\(UTC[+-][0-9]{1,2}:[0-9]{2}/)
  expect(items).toHaveLength(2)
})

test('load and passes react-select props', async () => {
  const { getByText } = render(
    <TimezoneSelect
      value={''}
      timezones={{
        ...allTimezones,
        'America/Lima': 'Pittsburgh',
      }}
      placeholder={'Please Select a Timezone'}
      onChange={e => e}
    />
  )

  expect(getByText('Please Select a Timezone')).toBeInTheDocument()
})

test('can determine timezone by approximate match', async () => {
  const { getByText } = render(
    <TimezoneSelect value="Europe/Rome" onChange={e => e} />
  )

  expect(
    getByText(
      /\(UTC\+[1-2]:00\) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna$/
    )
  ).toBeInTheDocument()
})

test('select drop-downs must use the fireEvent.change', () => {
  const onChangeSpy = jest.fn()
  const { container } = render(
    <TimezoneSelect
      value={'Europe/Amsterdam'}
      onChange={onChangeSpy}
      menuIsOpen={true}
    />
  )

  let selectOption = [
    ...container.querySelectorAll('div[id^="react-select"]'),
  ].find(n => n.textContent === '(UTC-10:00) Hawaii')

  fireEvent.click(selectOption)

  expect(onChangeSpy).toHaveBeenCalledTimes(1)
  expect(onChangeSpy).toHaveBeenCalledWith({
    value: 'Pacific/Honolulu',
    label: '(UTC-10:00) Hawaii',
    altName: 'Hawaii-Aleutian Standard Time',
    offset: -10,
    abbrev: 'HAST',
  })
})
