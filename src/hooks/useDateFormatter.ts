/**
 * Custom hook for formatting dates and times according to user preferences
 * Reads Timezone, DateFormat, and TimeFormat from user settings
 * Converts UTC dates from database to user's local timezone
 */

import { useMemo } from 'react';
import { parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { useAuth } from '@/contexts/AuthContext';

export type TDateFormatType = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
export type TTimeFormatType = '12h' | '24h';

interface IDateFormatterOptions {
  showTime?: boolean;
  showDate?: boolean;
}

export const useDateFormatter = () => {
  const { User } = useAuth();
console.log("User", User);
  // Get user preferences from settings, with fallbacks
  const timezone = User?.Timezone || 'UTC';
  const dateFormat: TDateFormatType = (User?.DateFormat as TDateFormatType) || 'DD-MM-YYYY';
  const timeFormat: TTimeFormatType = (User?.TimeFormat as TTimeFormatType) || '12h';

  // Convert date format to date-fns format string
  const dateFormatString = useMemo(() => {
    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return 'dd/MM/yyyy';
      case 'MM/DD/YYYY':
        return 'MM/dd/yyyy';
      case 'DD-MM-YYYY':
        return 'dd-MM-yyyy';
      case 'YYYY-MM-DD':
      default:
        return 'yyyy-MM-dd';
    }
  }, [dateFormat]);

  // Convert time format to date-fns format string
  const timeFormatString = useMemo(() => {
    return timeFormat === '12h' ? 'hh:mm:ss a' : 'HH:mm:ss';
  }, [timeFormat]);

  // Full datetime format
  const dateTimeFormatString = useMemo(() => {
    return `${dateFormatString} ${timeFormatString}`;
  }, [dateFormatString, timeFormatString]);

  /**
   * Format date only (no time)
   */
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatInTimeZone(dateObj, timezone, dateFormatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  /**
   * Format time only (no date)
   */
  const formatTime = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatInTimeZone(dateObj, timezone, timeFormatString);
    } catch (error) {
      console.error('Error formatting time:', error);
      return '-';
    }
  };

  /**
   * Format both date and time
   */
  const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatInTimeZone(dateObj, timezone, dateTimeFormatString);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '-';
    }
  };

  /**
   * Format date with custom options
   */
  const formatCustom = (
    date: string | Date | null | undefined,
    options: IDateFormatterOptions = {}
  ): string => {
    if (!date) return '-';

    const { showDate = true, showTime = true } = options;

    if (showDate && showTime) {
      return formatDateTime(date);
    } else if (showDate) {
      return formatDate(date);
    } else if (showTime) {
      return formatTime(date);
    }

    return '-';
  };

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  const formatRelative = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const zonedDate = toZonedTime(dateObj, timezone);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - zonedDate.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return '-';
    }
  };

  /**
   * Format duration (difference between two dates)
   */
  const formatDuration = (
    startDate: string | Date | null | undefined,
    endDate: string | Date | null | undefined
  ): string => {
    if (!startDate || !endDate) return '-';

    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

      const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        const seconds = diffInSeconds % 60;
        return `${minutes}m ${seconds}s`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        const hours = Math.floor((diffInSeconds % 86400) / 3600);
        return `${days}d ${hours}h`;
      }
    } catch (error) {
      console.error('Error formatting duration:', error);
      return '-';
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatCustom,
    formatRelative,
    formatDuration,
    timezone,
    dateFormat,
    timeFormat,
  };
};
