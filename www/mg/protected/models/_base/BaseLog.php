<?php

/**
 * This is the model base class for the table "log".
 * DO NOT MODIFY THIS FILE! It is automatically generated by giix.
 * If any changes are necessary, you must set or override the required
 * property or method in class "Log".
 *
 * Columns in table "log" available as properties of the model,
 * followed by relations of table "log" available as properties of the model.
 *
 * @property integer $id
 * @property string $level
 * @property string $category
 * @property string $logtime
 * @property string $message
 * @property integer $user_id
 *
 * @property User $user
 */
abstract class BaseLog extends GxActiveRecord {

	public static function model($className=__CLASS__) {
		return parent::model($className);
	}

	public function tableName() {
		return 'log';
	}

	public static function label($n = 1) {
		return Yii::t('app', 'Log|Logs', $n);
	}

	public static function representingColumn() {
		return 'level';
	}

	public function rules() {
		return array(
			array('level, category, logtime, message', 'required'),
			array('user_id', 'numerical', 'integerOnly'=>true),
			array('level, category', 'length', 'max'=>128),
			array('logtime', 'length', 'max'=>10),
			array('user_id', 'default', 'setOnEmpty' => true, 'value' => null),
			array('id, level, category, logtime, message, user_id', 'safe', 'on'=>'search'),
		);
	}

	public function relations() {
		return array(
			'user' => array(self::BELONGS_TO, 'User', 'user_id'),
		);
	}

	public function pivotModels() {
		return array(
		);
	}

	public function attributeLabels() {
		return array(
			'id' => Yii::t('app', 'ID'),
			'level' => Yii::t('app', 'Level'),
			'category' => Yii::t('app', 'Category'),
			'logtime' => Yii::t('app', 'Logtime'),
			'message' => Yii::t('app', 'Message'),
			'user_id' => null,
			'user' => null,
		);
	}

	public function search() {
		$criteria = new CDbCriteria;

		$criteria->compare('id', $this->id);
		$criteria->compare('level', $this->level, true);
		$criteria->compare('category', $this->category, true);
		$criteria->compare('logtime', $this->logtime, true);
		$criteria->compare('message', $this->message, true);
		$criteria->compare('user_id', $this->user_id);

		return new CActiveDataProvider($this, array(
			'criteria' => $criteria,
			'pagination'=>array(
        'pageSize'=>Yii::app()->params['pagination.pageSize'],
      ),
		));
	}
}