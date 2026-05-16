import { useRef, useState, useEffect } from 'react';
import type { MemberDTO } from '@alentapp/shared';
import { membersService } from '../services/members';

export function useMemberSearch(onSelectMember: (member: MemberDTO) => void) {
    const [memberSearch, setMemberSearch] = useState('');
    const [memberResults, setMemberResults] = useState<MemberDTO[]>([]);
    const [selectedMember, setSelectedMember] = useState<MemberDTO | null>(null);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);

    const memberSearchRef = useRef<HTMLDivElement | null>(null);

    const searchMembers = async (query: string) => {
        setMemberSearch(query);
        setSelectedMember(null);

        if (query.trim().length < 2) {
            setMemberResults([]);
            return;
        }

        setIsSearchingMembers(true);

        try {
            const results = await membersService.getAll(query);
            setMemberResults(results);
        } catch (err) {
            console.error('Error al buscar miembros:', err);
            setMemberResults([]);
        } finally {
            setIsSearchingMembers(false);
        }
    };

    const handleSelectMember = (member: MemberDTO) => {
        setSelectedMember(member);
        setMemberSearch(`${member.name} (${member.dni})`);
        setMemberResults([]);
        onSelectMember(member);
    };

    const resetMemberSearch = () => {
        setMemberSearch('');
        setMemberResults([]);
        setSelectedMember(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                memberSearchRef.current &&
                !memberSearchRef.current.contains(event.target as Node)
            ) {
                setMemberResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return {
        memberSearch,
        memberResults,
        selectedMember,
        isSearchingMembers,
        memberSearchRef,
        searchMembers,
        handleSelectMember,
        resetMemberSearch,
    };
}