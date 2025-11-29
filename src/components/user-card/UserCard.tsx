'use client';

import * as React from 'react';

import {
  UserCardRoot,
  UserAvatar,
  UserInfo,
  UserName,
  UserEmail,
} from './UserCard.styled';

interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onMenuClick?: () => void;
}

export default function UserCard({
  name,
  email,
  avatarUrl,
}: UserCardProps) {
  return (
    <UserCardRoot>
      <UserAvatar src={avatarUrl} alt={name} />

      <UserInfo>
        <UserName>
          {name}
        </UserName>
        <UserEmail>
          {email}
        </UserEmail>
      </UserInfo>
    </UserCardRoot>
  );
}
