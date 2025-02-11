import { UserRole } from 'user/user.model';
import './utils';
import { matching } from './utils';
import { expect } from '@jest/globals';

describe('Number', () => {
	describe('alpha', () => {
		it('success', () => {
			const randomLength = (100).random;
			expect(randomLength.alpha.length).toEqual(randomLength);
		});
	});

	describe('numeric', () => {
		it('success', () => {
			const randomLength = (100).random + 10;
			expect(randomLength.numeric.length).toEqual(randomLength);
		});
	});

	describe('string', () => {
		it('success', () => {
			const randomLength = (100).random;
			expect(randomLength.string.length).toEqual(randomLength);
		});
	});
});

describe('matching', () => {
	describe('return true', () => {
		it('case #1', () => {
			expect(matching(UserRole.faculty, [UserRole.faculty])).toEqual(true);
		});

		it('case #2', () => {
			expect(
				matching(UserRole.faculty, [UserRole.faculty, UserRole.student]),
			).toEqual(true);
		});

		it('case #3', () => {
			expect(
				matching(UserRole.admin, [UserRole.faculty, UserRole.student]),
			).toEqual(false);
		});

		it('case #4', () => {
			expect(matching(UserRole.admin, [])).toEqual(false);
		});
	});
});
