import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SelectInput from './SelectInput'
import React from 'react'

describe('SelectInput', () => {
    const options = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
    ]

    const onChangeMock = jest.fn()
    const onCreateNewMock = jest.fn(async (name: string) => ({
        label: name,
        value: name.toLowerCase(),
    }))

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders select input with label and options', () => {
        render(
            <SelectInput
                label="Test Label"
                options={options}
                selectedValue=""
                onChange={onChangeMock}
            />
        )

        expect(screen.getByText('Test Label')).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByText('Select Test Label')).toBeInTheDocument()
        expect(screen.getByText('Option A')).toBeInTheDocument()
        expect(screen.getByText('Option B')).toBeInTheDocument()
    })

    it('calls onChange when a value is selected', () => {
        render(
            <SelectInput
                label="Test Label"
                options={options}
                selectedValue=""
                onChange={onChangeMock}
            />
        )

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'a' },
        })

        expect(onChangeMock).toHaveBeenCalledWith('a')
    })

    it('shows create button when enabled', () => {
        render(
            <SelectInput
                label="Test Label"
                options={options}
                selectedValue=""
                onChange={onChangeMock}
                enableCreate
                onCreateNew={onCreateNewMock}
            />
        )

        expect(screen.getByText('Create New Test Label')).toBeInTheDocument()
    })

    it('shows input and buttons when create is clicked', () => {
        render(
            <SelectInput
                label="Test Label"
                options={options}
                selectedValue=""
                onChange={onChangeMock}
                enableCreate
                onCreateNew={onCreateNewMock}
            />
        )

        fireEvent.click(screen.getByText('Create New Test Label'))

        expect(screen.getByPlaceholderText('New Test Label name')).toBeInTheDocument()
        expect(screen.getByText('Save')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('calls onCreateNew and auto-selects the result on save', async () => {
        render(
            <SelectInput
                label="Test Label"
                options={options}
                selectedValue=""
                onChange={onChangeMock}
                enableCreate
                onCreateNew={onCreateNewMock}
            />
        )

        fireEvent.click(screen.getByText('Create New Test Label'))
        fireEvent.change(screen.getByPlaceholderText('New Test Label name'), {
            target: { value: 'Custom' },
        })
        fireEvent.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(onCreateNewMock).toHaveBeenCalledWith('Custom')
            expect(onChangeMock).toHaveBeenCalledWith('custom')
        })
    })

    it('resets state on cancel', () => {
        render(
            <SelectInput
                label="Test Label"
                options={options}
                selectedValue=""
                onChange={onChangeMock}
                enableCreate
                onCreateNew={onCreateNewMock}
            />
        )

        fireEvent.click(screen.getByText('Create New Test Label'))
        fireEvent.change(screen.getByPlaceholderText('New Test Label name'), {
            target: { value: 'Will cancel' },
        })

        fireEvent.click(screen.getByText('Cancel'))

        expect(screen.queryByPlaceholderText('New Test Label name')).not.toBeInTheDocument()
    })
})

