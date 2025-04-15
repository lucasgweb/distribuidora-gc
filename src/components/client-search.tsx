// ClientSearch.tsx
import { useRef, useEffect, useState } from "react";
import { Input } from "../components/ui/input";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "../components/ui/command";
import { Badge } from "../components/ui/badge";
import { Client } from "../dtos/client.dto";


interface ClientSearchProps {
    clients: Client[];
    selectedClient?: Client;
    onSelect: (client: Client) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    isLoading: boolean;
}

export function ClientSearch({ clients, selectedClient, onSelect, searchQuery, setSearchQuery, isLoading }: ClientSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">

            <Input
                placeholder="Buscar Cliente"
                value={selectedClient?.name || searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full cursor-text text-sm"
            />

            {
                clients.length > 0 && (
                    <>
                        {isOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-xl shadow-lg">
                                {isLoading ? (
                                    <div className="p-4 text-center">Cargando...</div>
                                ) : (
                                    <Command shouldFilter={false}>
                                        <CommandGroup className="max-h-60 overflow-y-auto">
                                            {filteredClients.map((client) => (
                                                <CommandItem
                                                    key={client.id}
                                                    value={client.name}
                                                    onSelect={() => {
                                                        onSelect(client);
                                                        setIsOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="cursor-pointer px-4 py-2 hover:bg-muted/50"
                                                >
                                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium truncate">{client.name}</span>
                                                            {selectedClient?.id === client.id && (
                                                                <Badge className="bg-green-400 px-2 py-0.5 text-xs">
                                                                    Seleccionado
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                            {client.email && <span>{client.email}</span>}
                                                            {client.phone && <span>• {client.phone}</span>}
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>


                                        <CommandEmpty className="py-2 px-4 text-sm">
                                            {searchQuery ? "Nenhum cliente encontrado" : "Digite para buscar..."}
                                        </CommandEmpty>
                                    </Command>
                                )}
                            </div>
                        )}
                    </>
                )
            }


        </div>
    );
}
