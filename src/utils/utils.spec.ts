import { Role } from 'user/user.model';
import './utils';
import { matching } from './utils';

describe('Number', () => {
	describe('alpha', () => {
		it('success', () => {
			const randomLength = (100).random;
			expect(randomLength.alpha.length).toEqual(randomLength);
		});
	});

	describe('numeric', () => {
		it('success', () => {
			const randomLength = (100).random;
			expect(randomLength.numeric.length).toEqual(randomLength);
		});
	});

	describe('string', () => {
		it('success', () => {
			const randomLength = (100).random + 1;
			expect(randomLength.string.length).toEqual(randomLength);
		});
	});
});

describe('matching', () => {
	describe('return true', () => {
		it('case #1', () => {
			expect(matching([Role.ADMIN], [Role.ADMIN])).toEqual(true);
		});

		it('case #2', () => {
			expect(matching([Role.ADMIN, Role.USER], [Role.ADMIN])).toEqual(true);
		});

		it('case #3', () => {
			expect(
				matching([Role.ADMIN, Role.USER], [Role.ADMIN, Role.USER]),
			).toEqual(true);
		});
	});

	describe('return false', () => {
		it('case #1', () => {
			expect(matching([Role.ADMIN], [Role.USER])).toEqual(false);
		});

		it('case #2', () => {
			expect(matching([Role.ADMIN], [Role.ADMIN, Role.USER])).toEqual(false);
		});

		it('case #3', () => {
			expect(
				matching([Role.ADMIN, Role.USER], [Role.ADMIN, Role.STAFF]),
			).toEqual(false);
		});
	});
});
