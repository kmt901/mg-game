<?php

/**
 * This is the model base class for the table "user_game".
 * DO NOT MODIFY THIS FILE! It is automatically generated by giix.
 * If any changes are necessary, you must set or override the required
 * property or method in class "UserGame".
 *
 * Columns in table "user_game" available as properties of the model,
 * followed by relations of table "user_game" available as properties of the model.
 *
 * @property integer $id
 * @property integer $user_id_1
 * @property integer $user_id_2
 * @property integer $game_id
 * @property integer $played_game_id
 * @property integer $turn_user_id
 *
 * @property Game $game
 * @property PlayedGame $playedGame
 * @property User $userId1
 * @property User $userId2
 */
abstract class BaseUserGame extends GxActiveRecord {

	public static function model($className=__CLASS__) {
		return parent::model($className);
	}

	public function tableName() {
		return 'user_game';
	}

	public static function label($n = 1) {
		return Yii::t('app', 'UserGame|UserGames', $n);
	}

	public static function representingColumn() {
		return 'id';
	}

	public function rules() {
		return array(
			array('user_id_1, user_id_2, game_id', 'required'),
			array('user_id_1, user_id_2, game_id, played_game_id, turn_user_id', 'numerical', 'integerOnly'=>true),
			array('played_game_id, turn_user_id', 'default', 'setOnEmpty' => true, 'value' => null),
			array('id, user_id_1, user_id_2, game_id, played_game_id, turn_user_id', 'safe', 'on'=>'search'),
		);
	}

	public function relations() {
		return array(
			'game' => array(self::BELONGS_TO, 'Game', 'game_id'),
			'playedGame' => array(self::BELONGS_TO, 'PlayedGame', 'played_game_id'),
			'userId1' => array(self::BELONGS_TO, 'User', 'user_id_1'),
			'userId2' => array(self::BELONGS_TO, 'User', 'user_id_2'),
		);
	}

	public function pivotModels() {
		return array(
		);
	}

	public function attributeLabels() {
		return array(
			'id' => Yii::t('app', 'ID'),
			'user_id_1' => null,
			'user_id_2' => null,
			'game_id' => null,
			'played_game_id' => null,
			'turn_user_id' => Yii::t('app', 'Turn User'),
			'game' => null,
			'playedGame' => null,
			'userId1' => null,
			'userId2' => null,
		);
	}

	public function search() {
		$criteria = new CDbCriteria;

		$criteria->compare('id', $this->id);
		$criteria->compare('user_id_1', $this->user_id_1);
		$criteria->compare('user_id_2', $this->user_id_2);
		$criteria->compare('game_id', $this->game_id);
		$criteria->compare('played_game_id', $this->played_game_id);
		$criteria->compare('turn_user_id', $this->turn_user_id);

		return new CActiveDataProvider($this, array(
			'criteria' => $criteria,
			'pagination'=>array(
        'pageSize'=>Yii::app()->fbvStorage->get("settings.pagination_size"),
      ),
		));
	}
}