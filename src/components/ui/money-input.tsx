import { useState, useEffect, useRef, InputHTMLAttributes } from 'react';
import { Input } from './input';

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    /** valor numérico em PEN */
    value?: number;
    /** recebe o valor numérico puro (ex: 1200.50) */
    onValueChange: (value: number) => void;
}

export function MoneyInput({
    value = 0,
    onValueChange,
    disabled,
    ...rest
}: MoneyInputProps) {
    // formatter para Perú: miles con coma, decimales con punto, 2 dígitos
    const formatter = new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const [display, setDisplay] = useState(formatter.format(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDisplay(formatter.format(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // somente dígitos
        const digits = e.target.value.replace(/[^\d]/g, '');
        // últimos 2 dígitos são centavos
        const num = digits ? parseFloat(digits) / 100 : 0;
        setDisplay(formatter.format(num));
        onValueChange(num);
    };

    const handleFocus = () => {
        // seleciona todo o texto ao focar
        inputRef.current?.select();
    };

    return (
        <Input
            {...rest}
            ref={inputRef}
            value={display}
            onChange={handleChange}
            onFocus={handleFocus}
            disabled={disabled}
            inputMode="decimal"
        />
    );
}
